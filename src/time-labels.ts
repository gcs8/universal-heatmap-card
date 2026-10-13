import type { BucketInterval } from "./types";

export function formatBucketDate(
  date: Date,
  interval: BucketInterval,
  locale?: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: interval === "hour" || interval === "5minute" ? "numeric" : undefined,
    minute: interval === "5minute" ? "2-digit" : undefined,
  }).format(date);
}

export function formatRowStart(
  date: Date,
  interval: BucketInterval,
  locale?: string,
): string {
  const options: Intl.DateTimeFormatOptions =
    interval === "month"
      ? { year: "2-digit" }
      : interval === "5minute"
        ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
        : { month: "short", day: "numeric" };
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function axisLabelsForInterval(interval?: BucketInterval): { x: string; y: string } {
  switch (interval) {
    case "5minute":
      return {
        x: "elapsed time within each 4-hour row",
        y: "local date and row start time",
      };
    case "hour":
      return { x: "time of day", y: "date" };
    case "day":
      return { x: "day of week", y: "week row" };
    case "week":
      return { x: "week", y: "period row" };
    case "month":
      return { x: "month", y: "period row" };
    default:
      return { x: "bucket", y: "row" };
  }
}

export interface AxisTick {
  col: number;
  label: string;
  align: "left" | "center" | "right";
}

export function fiveMinuteElapsedTicks(): AxisTick[] {
  const columns = [0, 12, 24, 36, 47];
  return columns.map((col, index) => ({
    col,
    label: formatElapsedMinutes(col * 5),
    align: index === 0 ? "left" : index === columns.length - 1 ? "right" : "center",
  }));
}

/** Short weekday names for a Monday-first week, in the given locale. */
export function weekdayTickLabels(locale?: string): AxisTick[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // Monday, January 1, 2024 anchors a fixed Monday-first week.
  return Array.from({ length: 7 }, (_, col) => ({
    col,
    label: format.format(new Date(2024, 0, 1 + col)),
    align: "center" as const,
  }));
}

/** Short month names at the monthly grid's tick columns, in the given locale. */
export function monthTickLabels(locale?: string): AxisTick[] {
  // Bucket columns use Date.getMonth(), even when the locale requests another calendar.
  const format = new Intl.DateTimeFormat(locale, { month: "short", calendar: "gregory" });
  const columns = [0, 3, 6, 9, 11];
  return columns.map((col, index) => ({
    col,
    label: format.format(new Date(2024, col, 1)),
    align: index === 0 ? "left" : index === columns.length - 1 ? "right" : "center",
  }));
}

function formatElapsedMinutes(minutes: number): string {
  if (minutes === 0) {
    return "0h";
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `+${hours}h${remainder === 0 ? "" : `${remainder}m`}`;
}
