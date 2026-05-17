import type {
  BucketInterval,
  BucketValue,
  BucketValueName,
  BucketWindow,
  DateRange,
  HistoryStateRow,
  MissingMode,
  StatisticsRow,
} from "../types";

export function statisticsPeriodForInterval(interval: BucketInterval): string {
  return interval;
}

export function statisticsTypeForValue(value: BucketValueName): string | null {
  if (value === "last") {
    return "state";
  }
  if (["mean", "min", "max", "state", "sum", "change"].includes(value)) {
    return value;
  }
  return null;
}

export function alignStart(date: Date, interval: BucketInterval): Date {
  const aligned = new Date(date);
  aligned.setMilliseconds(0);
  aligned.setSeconds(0);

  if (interval !== "5minute") {
    aligned.setMinutes(0);
  } else {
    aligned.setMinutes(Math.floor(aligned.getMinutes() / 5) * 5);
  }
  if (interval === "day" || interval === "week" || interval === "month") {
    aligned.setHours(0, 0, 0, 0);
  }
  if (interval === "week") {
    const day = aligned.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    aligned.setDate(aligned.getDate() + diff);
  }
  if (interval === "month") {
    aligned.setDate(1);
  }

  return aligned;
}

export function addInterval(date: Date, interval: BucketInterval): Date {
  const next = new Date(date);
  switch (interval) {
    case "5minute":
      next.setMinutes(next.getMinutes() + 5);
      return next;
    case "hour":
      next.setHours(next.getHours() + 1);
      return next;
    case "day":
      next.setDate(next.getDate() + 1);
      return next;
    case "week":
      next.setDate(next.getDate() + 7);
      return next;
    case "month":
      next.setMonth(next.getMonth() + 1);
      return next;
    default:
      return next;
  }
}

export function generateBucketWindows(
  range: DateRange,
  interval: BucketInterval,
): BucketWindow[] {
  const windows: BucketWindow[] = [];
  let cursor = alignStart(range.start, interval);

  while (cursor < range.end) {
    const next = addInterval(cursor, interval);
    if (next > range.start) {
      windows.push({ start: new Date(cursor), end: new Date(next) });
    }
    cursor = next;
  }

  return windows;
}

export function emptyBuckets(
  windows: BucketWindow[],
  source: BucketValue["source"],
): BucketValue[] {
  return windows.map((window) => ({
    ...window,
    value: null,
    quality: "missing",
    source,
  }));
}

export function statisticsRowsToBuckets(
  windows: BucketWindow[],
  rows: StatisticsRow[],
  requestedValue: BucketValueName,
  missingMode: MissingMode,
): BucketValue[] {
  const statType = statisticsTypeForValue(requestedValue);
  const buckets = emptyBuckets(windows, "statistics");

  if (!statType) {
    return applyMissingMode(buckets, missingMode);
  }

  for (const row of rows) {
    const rowStart = row.start ? new Date(row.start) : undefined;
    if (!rowStart || Number.isNaN(rowStart.getTime())) {
      continue;
    }
    const index = findBucketIndex(windows, rowStart);
    if (index < 0) {
      continue;
    }
    const window = windows[index];
    if (!window) {
      continue;
    }
    const rawValue = row[statType as keyof StatisticsRow];
    const value = typeof rawValue === "number" ? rawValue : null;
    buckets[index] = {
      ...window,
      value,
      quality: value === null ? "missing" : "ok",
      source: "statistics",
    };
  }

  return applyMissingMode(buckets, missingMode);
}

export function historyRowsToBuckets(
  windows: BucketWindow[],
  rows: HistoryStateRow[],
  requestedValue: BucketValueName,
  missingMode: MissingMode,
): BucketValue[] {
  const valuesByBucket = windows.map(() => [] as Array<{ at: number; value: number }>);

  for (const row of rows) {
    const value = Number(row.state);
    if (!Number.isFinite(value)) {
      continue;
    }
    const atRaw = row.last_changed ?? row.last_updated;
    if (!atRaw) {
      continue;
    }
    const at = new Date(atRaw).getTime();
    if (!Number.isFinite(at)) {
      continue;
    }
    const index = findBucketIndexByTimestamp(windows, at);
    if (index >= 0) {
      valuesByBucket[index]?.push({ at, value });
    }
  }

  const buckets = windows.map((window, index) => {
    const values = valuesByBucket[index] ?? [];
    const value = aggregateValues(values, requestedValue);
    return {
      ...window,
      value,
      quality: value === null ? ("missing" as const) : ("ok" as const),
      source: "history" as const,
    };
  });

  return applyMissingMode(buckets, missingMode);
}

export function applyMissingMode(
  buckets: BucketValue[],
  missingMode: MissingMode,
): BucketValue[] {
  if (missingMode === "empty") {
    return buckets;
  }

  let carried: number | null = null;
  return buckets.map((bucket) => {
    if (bucket.value !== null) {
      carried = bucket.value;
      return bucket;
    }
    if (missingMode === "zero") {
      return { ...bucket, value: 0, quality: "ok" };
    }
    if (missingMode === "carry_forward" && carried !== null) {
      return { ...bucket, value: carried, quality: "carried" };
    }
    return bucket;
  });
}

function aggregateValues(
  values: Array<{ at: number; value: number }>,
  requestedValue: BucketValueName,
): number | null {
  if (values.length === 0) {
    return null;
  }

  switch (requestedValue) {
    case "min":
      return Math.min(...values.map((sample) => sample.value));
    case "max":
      return Math.max(...values.map((sample) => sample.value));
    case "last":
    case "state": {
      const latest = values.reduce((selected, sample) =>
        sample.at >= selected.at ? sample : selected,
      );
      return latest.value;
    }
    case "sum":
      return values.reduce((total, sample) => total + sample.value, 0);
    case "delta":
    case "change": {
      const sorted = [...values].sort((a, b) => a.at - b.at);
      const first = sorted[0]?.value;
      const last = sorted[sorted.length - 1]?.value;
      return first === undefined || last === undefined ? null : last - first;
    }
    case "count":
      return values.length;
    case "mean":
    default:
      return values.reduce((total, sample) => total + sample.value, 0) / values.length;
  }
}

function findBucketIndex(windows: BucketWindow[], at: Date): number {
  return findBucketIndexByTimestamp(windows, at.getTime());
}

function findBucketIndexByTimestamp(windows: BucketWindow[], at: number): number {
  let low = 0;
  let high = windows.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const window = windows[mid];
    if (!window) {
      return -1;
    }
    if (at < window.start.getTime()) {
      high = mid - 1;
    } else if (at >= window.end.getTime()) {
      low = mid + 1;
    } else {
      return mid;
    }
  }

  return -1;
}
