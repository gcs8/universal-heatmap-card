import type { BucketValue, ColorStop, ScaleConfig, ScaleModel } from "./types";

const DEFAULT_STOPS: ColorStop[] = [
  { value: 0, color: "#3a6ea5" },
  { value: 0.5, color: "#6fbf73" },
  { value: 1, color: "#f6c85f" },
];

export function buildScale(buckets: BucketValue[], config: ScaleConfig): ScaleModel {
  const allValues = buckets
    .map((bucket) => bucket.value)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  // Ignoring zero must only drop zeros. Negative values are real data and stay
  // in the domain; the auto heuristic is meant for non-negative sensors only.
  const nonZeroValues = allValues.filter((value) => value !== 0);
  const shouldIgnoreZero =
    config.ignore_zero === true ||
    (config.ignore_zero !== false &&
      nonZeroValues.length > 0 &&
      allValues.some((value) => value === 0) &&
      !allValues.some((value) => value < 0));
  const values = shouldIgnoreZero ? nonZeroValues : allValues;
  const clippedRange = calculateDataRange(values, config.outlier_clip);
  const dataMin = clippedRange.min;
  const dataMax = clippedRange.max;
  const min = typeof config.min === "number" ? config.min : dataMin;
  const max = typeof config.max === "number" ? config.max : dataMax === min ? min + 1 : dataMax;
  const rawStops = config.stops?.length ? config.stops : DEFAULT_STOPS;
  const stops = normalizeStops(rawStops, min, max, config.invert ?? false);
  const sensitivity = normalizeSensitivity(config.sensitivity);

  return {
    min,
    max,
    unit: config.unit,
    sensitivity,
    stops,
    clippedLow: allValues.some((value) => value < min),
    clippedHigh: allValues.some((value) => value > max),
  };
}

export function colorForValue(value: number | null, scale: ScaleModel): string {
  if (value === null || !Number.isFinite(value)) {
    return "rgba(127, 127, 127, 0.22)";
  }

  const clipped = valueToSensitiveScaleValue(value, scale);
  const stops = scale.stops;

  if (stops.length === 0) {
    return "#999999";
  }
  if (stops.length === 1) {
    return stops[0]?.color ?? "#999999";
  }

  for (let index = 0; index < stops.length - 1; index += 1) {
    const left = stops[index];
    const right = stops[index + 1];
    if (!left || !right) {
      continue;
    }
    if (clipped >= left.value && clipped <= right.value) {
      const span = right.value - left.value || 1;
      const t = (clipped - left.value) / span;
      return interpolateColor(left.color, right.color, t);
    }
  }

  if (clipped < (stops[0]?.value ?? scale.min)) {
    return stops[0]?.color ?? "#999999";
  }
  return stops[stops.length - 1]?.color ?? "#999999";
}

export function legendGradient(scale: ScaleModel, samples = 18): string {
  const span = scale.max - scale.min || 1;
  const count = Math.max(2, samples);
  return Array.from({ length: count }, (_unused, index) => {
    const position = index / (count - 1);
    const value = scale.min + span * position;
    return `${colorForValue(value, scale)} ${position * 100}%`;
  }).join(", ");
}

export function formatValue(value: number | null, scale: ScaleModel, locale?: string): string {
  if (value === null || !Number.isFinite(value)) {
    return "missing";
  }

  const absolute = Math.abs(value);
  const maximumFractionDigits = absolute >= 100 ? 0 : absolute >= 10 ? 1 : 2;
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(value);

  return scale.unit ? `${formatted} ${scale.unit}` : formatted;
}

function normalizeStops(
  stops: ColorStop[],
  min: number,
  max: number,
  invert: boolean,
): ColorStop[] {
  const useRelativeStops = stops.every((stop) => stop.value >= 0 && stop.value <= 1);
  const normalized = stops.map((stop) => {
    if (useRelativeStops) {
      return { ...stop, value: min + stop.value * (max - min) };
    }

    return stop;
  });

  const sorted = normalized.sort((a, b) => a.value - b.value);
  if (!invert) {
    return sorted;
  }

  const colors = sorted.map((stop) => stop.color).reverse();
  return sorted.map((stop, index) => ({
    ...stop,
    color: colors[index] ?? stop.color,
  }));
}

function calculateDataRange(
  values: number[],
  outlierClip: ScaleConfig["outlier_clip"],
): { min: number; max: number } {
  if (values.length === 0) {
    return { min: 0, max: 1 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const clip = normalizeOutlierClip(outlierClip);
  if (!clip) {
    return {
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 1,
    };
  }

  const min = percentileNearest(sorted, clip.low);
  const max = percentileNearest(sorted, clip.high);
  return max <= min
    ? {
        min: sorted[0] ?? 0,
        max: sorted[sorted.length - 1] ?? min + 1,
      }
    : { min, max };
}

function normalizeOutlierClip(
  outlierClip: ScaleConfig["outlier_clip"],
): { low: number; high: number } | null {
  if (typeof outlierClip === "number") {
    if (!Number.isFinite(outlierClip) || outlierClip <= 0) {
      return null;
    }
    const amount = clamp(outlierClip, 0, 49);
    return { low: amount, high: 100 - amount };
  }

  if (!Array.isArray(outlierClip) || outlierClip.length !== 2) {
    return null;
  }

  const low = Number(outlierClip[0]);
  const high = Number(outlierClip[1]);
  if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) {
    return null;
  }
  return {
    low: clamp(low, 0, 100),
    high: clamp(high, 0, 100),
  };
}

function percentileNearest(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }
  const index = clamp(
    Math.ceil((percentile / 100) * sortedValues.length) - 1,
    0,
    sortedValues.length - 1,
  );
  return sortedValues[index] ?? sortedValues[0] ?? 0;
}

function normalizeSensitivity(sensitivity: number | undefined): number {
  if (typeof sensitivity !== "number" || !Number.isFinite(sensitivity) || sensitivity <= 0) {
    return 1;
  }
  return clamp(sensitivity, 0.1, 5);
}

function valueToSensitiveScaleValue(value: number, scale: ScaleModel): number {
  const span = scale.max - scale.min || 1;
  const clipped = clamp(value, scale.min, scale.max);
  const position = (clipped - scale.min) / span;
  const sensitivePosition = clamp(0.5 + (position - 0.5) * scale.sensitivity, 0, 1);
  return scale.min + sensitivePosition * span;
}

function interpolateColor(left: string, right: string, t: number): string {
  const a = hexToRgb(left);
  const b = hexToRgb(right);
  if (!a || !b) {
    return t < 0.5 ? left : right;
  }

  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const blue = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${blue})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "").trim();
  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return null;
  }

  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}
