import type { HeatmapCardConfig } from "./types";

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
        entities: "Entities",
        refresh_interval: "Refresh interval",
        defer_until_visible: "Load when visible",
        max_concurrent_requests: "Concurrent recorder requests",
        max_cells: "Maximum cells",
        outlier_clip: "Outlier clip",
        align: "Alignment",
      };
      return schema.name ? labels[schema.name] : undefined;
    },
    computeHelper: (schema: { name?: string }) => {
      const helpers: Record<string, string> = {
        entities: "Choose one or more numeric sensor entities. Existing YAML names and per-entity options are preserved for unchanged entities.",
        debug: "Writes cache and timing details to the browser console. Leave off unless diagnosing.",
        align: "Fixed days align to local midnight and render stable 00:00-23:59 columns. Rolling ends at the current time.",
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
  const source = config.entities?.length
    ? config.entities
    : config.entity
      ? [config.entity]
      : [];

  return source
    .map((entry) => (typeof entry === "string" ? entry : entry.entity))
    .filter((entity): entity is string => typeof entity === "string" && entity.length > 0);
}
