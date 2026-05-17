import type { HeatmapCardConfig, HeatmapEntityConfig } from "./types";

export interface EditorFormConfig extends Record<string, unknown> {
  schema: Array<Record<string, unknown>>;
  computeLabel: (schema: { name?: string }) => string | undefined;
  computeHelper: (schema: { name?: string }) => string | undefined;
}

export function buildEditorFormConfig(): EditorFormConfig {
  const bucketIntervals = ["5minute", "hour", "day", "week", "month"];
  const bucketValues = [
    "mean",
    "min",
    "max",
    "last",
    "state",
    "sum",
    "delta",
    "change",
    "count",
    "percent_on",
    "duration_on",
  ];
  const rangeAlignments = [
    { value: "day", label: "Fixed days, 00:00-23:59" },
    { value: "rolling", label: "Rolling window" },
  ];
  const scalePresets = [
    "auto",
    "temperature",
    "power",
    "energy_delta",
    "humidity",
    "percent_health",
    "percent_utilization",
    "filter_dp",
    "filter_life",
    "filter_load",
    "battery",
    "signal_quality",
    "binary_runtime",
  ];

  return {
    schema: [
      { name: "title", selector: { text: {} } },
      {
        name: "entities",
        required: true,
        selector: {
          entity: {
            domain: "sensor",
            multiple: true,
            reorder: true,
          },
        },
      },
      { name: "debug", selector: { boolean: {} } },
      {
        type: "expandable",
        name: "range",
        title: "Range",
        schema: [
          { name: "hours", selector: { number: { min: 1, max: 720, mode: "box" } } },
          { name: "days", selector: { number: { min: 1, max: 365, mode: "box" } } },
          { name: "align", selector: { select: { options: rangeAlignments } } },
        ],
      },
      {
        type: "expandable",
        name: "bucket",
        title: "Bucket",
        schema: [
          { name: "interval", selector: { select: { options: bucketIntervals } } },
          { name: "value", selector: { select: { options: bucketValues } } },
        ],
      },
      {
        type: "expandable",
        name: "scale",
        title: "Scale",
        schema: [
          { name: "preset", selector: { select: { options: scalePresets } } },
          { name: "min", selector: { number: { mode: "box" } } },
          { name: "max", selector: { number: { mode: "box" } } },
          { name: "unit", selector: { text: {} } },
          {
            name: "sensitivity",
            selector: { number: { min: 0.2, max: 4, step: 0.1, mode: "slider" } },
          },
          {
            name: "outlier_clip",
            selector: { number: { min: 0, max: 20, step: 0.5, mode: "box" } },
          },
        ],
      },
      {
        type: "expandable",
        name: "data",
        title: "Data",
        schema: [
          { name: "provider", selector: { select: { options: ["auto", "statistics", "history"] } } },
          { name: "refresh_interval", selector: { number: { min: 0, max: 86400, mode: "box" } } },
          { name: "defer_until_visible", selector: { boolean: {} } },
          { name: "max_concurrent_requests", selector: { number: { min: 1, max: 8, mode: "box" } } },
          { name: "max_cells", selector: { number: { min: 1, max: 50000, mode: "box" } } },
        ],
      },
    ],
    computeLabel: (schema: { name?: string }) => {
      const labels: Record<string, string> = {
        title: "Title",
        entities: "Entities",
        debug: "Debug logging",
        hours: "Hours",
        days: "Days",
        refresh_interval: "Refresh interval",
        defer_until_visible: "Load when visible",
        max_concurrent_requests: "Concurrent recorder requests",
        max_cells: "Maximum cells",
        interval: "Interval",
        value: "Value",
        provider: "Provider",
        preset: "Scale preset",
        min: "Minimum value",
        max: "Maximum value",
        unit: "Display unit",
        sensitivity: "Scale tuning",
        outlier_clip: "Outlier clip",
        align: "Alignment",
      };
      return schema.name ? labels[schema.name] : undefined;
    },
    computeHelper: (schema: { name?: string }) => {
      const helpers: Record<string, string> = {
        entities: "Choose one or more numeric sensor entities. Existing YAML names and per-entity options are preserved for unchanged entities.",
        debug: "Writes cache and timing details to the browser console. Leave off unless diagnosing.",
        title: "Optional card title. Leave blank to use the active entity name.",
        hours: "Optional rolling or fixed-hour window. Usually leave empty when using days.",
        days: "Number of days to show. Hourly fixed-day heatmaps use full local days.",
        align: "Fixed days align to local midnight and render stable 00:00-23:59 columns. Rolling ends at the current time.",
        interval: "Bucket width for the heatmap cells.",
        value: "Recorder statistic or history value to aggregate into each bucket.",
        provider: "Auto prefers recorder statistics and falls back to capped raw history when needed.",
        preset: "Unit-aware color and bucket defaults. Auto infers from device class, unit, and entity name.",
        min: "Optional fixed lower scale bound. Leave empty to auto-range from observed bucket values.",
        max: "Optional fixed upper scale bound. Leave empty to auto-range from observed bucket values.",
        unit: "Optional label suffix for summary and legend values.",
        refresh_interval: "Minimum seconds between recorder refreshes during Home Assistant updates. Set to 0 to cache until the card config changes.",
        defer_until_visible: "Keeps off-screen cards from asking recorder for history until they scroll near the viewport.",
        max_concurrent_requests: "Shared browser-side limit for recorder/history requests from this card type. Default is 2.",
        sensitivity: "Higher values exaggerate close differences; lower values soften peaky data.",
        outlier_clip: "Percentile trim for auto-range scaling. Leave empty for full observed range.",
      };
      return schema.name ? helpers[schema.name] : undefined;
    },
  };
}

export function editorEntityIds(config: HeatmapCardConfig): string[] {
  return editorEntityEntries(config)
    .map((entry) => (typeof entry === "string" ? entry : entry.entity))
    .filter((entity): entity is string => typeof entity === "string" && entity.length > 0);
}

export function editorEntityEntries(config: HeatmapCardConfig): Array<string | HeatmapEntityConfig> {
  const source = config.entities?.length
    ? config.entities
    : config.entity
      ? [config.entity]
      : [];

  return source.map((entry) => (typeof entry === "string" ? entry : { ...entry }));
}

export function mergeEditorEntities(
  config: HeatmapCardConfig,
  selectedEntities: string[],
): Array<string | HeatmapEntityConfig> {
  const existing = new Map<string, string | HeatmapEntityConfig>();

  for (const entry of editorEntityEntries(config)) {
    const entity = typeof entry === "string" ? entry : entry.entity;
    if (entity) {
      existing.set(entity, typeof entry === "string" ? entry : { ...entry });
    }
  }

  return selectedEntities.map((entity) => existing.get(entity) ?? entity);
}

export function updateEditorEntityName(
  config: HeatmapCardConfig,
  entityId: string,
  name: string,
): HeatmapCardConfig {
  const selectedEntities = editorEntityIds(config);
  const alias = name.trim();
  const entities = mergeEditorEntities(config, selectedEntities).map((entry) => {
    const entity = typeof entry === "string" ? entry : entry.entity;
    if (entity !== entityId) {
      return entry;
    }

    const next: HeatmapEntityConfig = typeof entry === "string" ? { entity } : { ...entry };
    if (alias) {
      next.name = alias;
    } else {
      delete next.name;
    }

    return Object.keys(next).length === 1 ? entity : next;
  });

  const nextConfig: HeatmapCardConfig = {
    ...config,
    entities,
  };
  delete nextConfig.entity;
  return nextConfig;
}
