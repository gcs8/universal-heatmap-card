import { inferPresetFromEntity, resolvePreset } from "./presets";
import type {
  DateRange,
  HeatmapCardConfig,
  HeatmapEntityConfig,
  HomeAssistant,
  NormalizedConfig,
  NormalizedEntityConfig,
} from "./types";
import { normalizeMaxConcurrent } from "./data/request-queue";

const DEFAULT_MAX_CELLS = 5000;
const DEFAULT_RAW_HISTORY_HOURS = 24;
const DEFAULT_REFRESH_INTERVAL = 300;

export function normalizeConfig(
  config: HeatmapCardConfig,
  hass?: HomeAssistant,
): NormalizedConfig {
  const entities = normalizeEntities(config, hass);
  if (entities.length === 0) {
    throw new Error("Universal Heatmap Card requires entity or entities.");
  }

  const activeEntity = entities[0];
  const stateObj = activeEntity ? hass?.states[activeEntity.entity] : undefined;
  const inferredPreset = inferPresetFromEntity(stateObj);
  const scalePresetName = config.scale?.preset ?? inferredPreset;
  const preset = resolvePreset(scalePresetName);

  const bucket = {
    interval: config.bucket?.interval ?? preset.bucket.interval,
    value: config.bucket?.value ?? preset.bucket.value,
  };

  const range = {
    ...preset.range,
    ...config.range,
    align: normalizeRangeAlignment(config.range?.align),
  };
  // Validate now so a bad range (days: 0, reversed start/end, unparseable
  // dates) throws inside setConfig, where Home Assistant renders its error
  // card, instead of escaping later from getCardSize/getGridOptions.
  calculateRange(range);

  const navigationMode =
    config.navigation?.mode ?? (entities.length > 8 ? "dropdown" : "tabs");

  return {
    title: config.title,
    debug: config.debug ?? false,
    entities,
    range,
    bucket,
    data: {
      provider: config.data?.provider ?? "auto",
      prefetch: config.data?.prefetch ?? false,
      max_cells: config.data?.max_cells ?? DEFAULT_MAX_CELLS,
      raw_history_hours: config.data?.raw_history_hours ?? DEFAULT_RAW_HISTORY_HOURS,
      refresh_interval: normalizeRefreshInterval(config.data?.refresh_interval),
      defer_until_visible: config.data?.defer_until_visible ?? true,
      max_concurrent_requests: normalizeMaxConcurrent(config.data?.max_concurrent_requests),
    },
    missing: {
      mode: config.missing?.mode ?? "empty",
    },
    scale: {
      ...preset.scale,
      ...config.scale,
      preset: scalePresetName,
    },
    layout: {
      mode: config.layout?.mode ?? "auto",
      bound_to_grid: config.layout?.bound_to_grid ?? "auto",
    },
    navigation: {
      mode: navigationMode,
    },
    axes: {
      show: config.axes?.show ?? true,
      x_labels: config.axes?.x_labels ?? true,
      y_labels: config.axes?.y_labels ?? true,
      show_key: config.axes?.show_key ?? false,
    },
    tiles: {
      show_values: config.tiles?.show_values ?? false,
      show_value_toggle: config.tiles?.show_value_toggle ?? false,
    },
    legend: {
      show: config.legend?.show ?? true,
    },
    tooltip: {
      show: config.tooltip?.show ?? true,
    },
  };
}

function normalizeRefreshInterval(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_REFRESH_INTERVAL;
  }
  return Math.max(0, value);
}

function normalizeRangeAlignment(value: unknown): "rolling" | "day" {
  return value === "rolling" ? "rolling" : "day";
}

function normalizeEntities(
  config: HeatmapCardConfig,
  hass?: HomeAssistant,
): NormalizedEntityConfig[] {
  const source = config.entities?.length
    ? config.entities
    : config.entity
      ? [{ entity: config.entity }]
      : [];

  return source.map((entry) => {
    const entityConfig: HeatmapEntityConfig =
      typeof entry === "string" ? { entity: entry } : entry;
    const stateObj = hass?.states[entityConfig.entity];
    const friendlyName =
      entityConfig.name ??
      (stateObj && hass?.formatEntityName
        ? hass.formatEntityName(stateObj)
        : stateObj?.attributes.friendly_name
        ? String(stateObj.attributes.friendly_name)
        : entityConfig.entity);

    return {
      ...entityConfig,
      name: friendlyName,
    };
  });
}

export function calculateRange(range: NormalizedConfig["range"], now = new Date()): DateRange {
  const dayAligned = range.align === "day" && !range.end;
  const end = range.end ? new Date(range.end) : dayAligned ? startOfNextLocalDay(now) : now;
  let start: Date;

  if (range.start) {
    start = new Date(range.start);
  } else if (typeof range.hours === "number") {
    start = new Date(end.getTime() - range.hours * 60 * 60 * 1000);
  } else {
    const days = typeof range.days === "number" ? range.days : 30;
    start = dayAligned ? subtractLocalDays(end, days) : new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  }

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Universal Heatmap Card has an invalid range date.");
  }
  if (start >= end) {
    throw new Error("Universal Heatmap Card range start must be before end.");
  }

  return { start, end };
}

function startOfNextLocalDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + 1);
  return next;
}

function subtractLocalDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function estimateCellCount(config: NormalizedConfig, now = new Date()): number {
  const range = calculateRange(config.range, now);
  const hours = (range.end.getTime() - range.start.getTime()) / 3_600_000;

  switch (config.bucket.interval) {
    case "5minute":
      return Math.ceil(hours * 12);
    case "hour":
      return Math.ceil(hours);
    case "day":
      return Math.ceil(hours / 24);
    case "week":
      return Math.ceil(hours / (24 * 7));
    case "month":
      return Math.ceil(hours / (24 * 30));
    default:
      return Math.ceil(hours / 24);
  }
}
