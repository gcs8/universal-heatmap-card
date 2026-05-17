import type {
  BucketConfig,
  ColorStop,
  HassEntity,
  RangeConfig,
  ScaleConfig,
} from "./types";

export interface HeatmapPreset {
  id: string;
  label: string;
  range: RangeConfig;
  bucket: Required<BucketConfig>;
  scale: ScaleConfig;
  highIsBad?: boolean;
}

const comfortStops: ColorStop[] = [
  { value: 55, color: "#315f9d", label: "Cool" },
  { value: 68, color: "#58a4b0", label: "Comfort" },
  { value: 76, color: "#f2c14e", label: "Warm" },
  { value: 85, color: "#d94841", label: "Hot" },
];

const thresholdStops: ColorStop[] = [
  { value: 0, color: "#2f6f9f" },
  { value: 50, color: "#5aa469" },
  { value: 75, color: "#f2c14e" },
  { value: 100, color: "#c44536" },
];

const relativeThresholdStops: ColorStop[] = [
  { value: 0, color: "#2f6f9f" },
  { value: 0.5, color: "#5aa469" },
  { value: 0.75, color: "#f2c14e" },
  { value: 1, color: "#c44536" },
];

const healthStops: ColorStop[] = [
  { value: 0, color: "#c44536", label: "Low" },
  { value: 35, color: "#f2c14e", label: "Watch" },
  { value: 70, color: "#5aa469", label: "Good" },
  { value: 100, color: "#2f6f9f", label: "Full" },
];

export const PRESETS: Record<string, HeatmapPreset> = {
  auto: {
    id: "auto",
    label: "Auto",
    range: { days: 30 },
    bucket: { interval: "day", value: "mean" },
    scale: {
      preset: "auto",
      stops: [
        { value: 0, color: "#3a6ea5" },
        { value: 0.5, color: "#6fbf73" },
        { value: 1, color: "#f6c85f" },
      ],
    },
  },
  temperature: {
    id: "temperature",
    label: "Temperature",
    range: { days: 30 },
    bucket: { interval: "day", value: "mean" },
    scale: { preset: "temperature", unit: "°", stops: comfortStops },
  },
  humidity: {
    id: "humidity",
    label: "Humidity",
    range: { days: 30 },
    bucket: { interval: "day", value: "mean" },
    scale: {
      preset: "humidity",
      min: 0,
      max: 100,
      unit: "%",
      stops: thresholdStops,
    },
  },
  power: {
    id: "power",
    label: "Power",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "power", stops: relativeThresholdStops },
    highIsBad: true,
  },
  energy_delta: {
    id: "energy_delta",
    label: "Energy Delta",
    range: { days: 30 },
    bucket: { interval: "day", value: "change" },
    scale: { preset: "energy_delta", stops: relativeThresholdStops },
  },
  percent_health: {
    id: "percent_health",
    label: "Percent Health",
    range: { days: 90 },
    bucket: { interval: "day", value: "min" },
    scale: {
      preset: "percent_health",
      min: 0,
      max: 100,
      unit: "%",
      stops: healthStops,
    },
  },
  percent_utilization: {
    id: "percent_utilization",
    label: "Percent Utilization",
    range: { days: 30 },
    bucket: { interval: "day", value: "mean" },
    scale: {
      preset: "percent_utilization",
      min: 0,
      max: 100,
      unit: "%",
      stops: thresholdStops,
    },
    highIsBad: true,
  },
  filter_life: {
    id: "filter_life",
    label: "Filter Life",
    range: { days: 90 },
    bucket: { interval: "day", value: "min" },
    scale: {
      preset: "filter_life",
      min: 0,
      max: 100,
      unit: "%",
      stops: healthStops,
    },
  },
  filter_load: {
    id: "filter_load",
    label: "Filter Load",
    range: { days: 90 },
    bucket: { interval: "day", value: "max" },
    scale: {
      preset: "filter_load",
      min: 0,
      max: 100,
      unit: "%",
      stops: thresholdStops,
    },
    highIsBad: true,
  },
  filter_dp: {
    id: "filter_dp",
    label: "Filter Differential Pressure",
    range: { days: 30 },
    bucket: { interval: "hour", value: "max" },
    scale: { preset: "filter_dp", stops: relativeThresholdStops },
    highIsBad: true,
  },
  binary_runtime: {
    id: "binary_runtime",
    label: "Binary Runtime",
    range: { days: 14 },
    bucket: { interval: "hour", value: "percent_on" },
    scale: {
      preset: "binary_runtime",
      min: 0,
      max: 100,
      unit: "%",
      stops: thresholdStops,
    },
  },
  battery: {
    id: "battery",
    label: "Battery",
    range: { days: 90 },
    bucket: { interval: "day", value: "min" },
    scale: {
      preset: "battery",
      min: 0,
      max: 100,
      unit: "%",
      stops: healthStops,
    },
  },
  signal_quality: {
    id: "signal_quality",
    label: "Signal Quality",
    range: { days: 30 },
    bucket: { interval: "day", value: "min" },
    scale: { preset: "signal_quality", stops: relativeThresholdStops },
  },
};

export function resolvePreset(id: string | undefined): HeatmapPreset {
  if (!id || id === "auto") {
    return PRESETS.auto!;
  }
  return PRESETS[id] ?? PRESETS.auto!;
}

export function inferPresetFromEntity(stateObj?: HassEntity): string {
  if (!stateObj) {
    return "auto";
  }

  const entityId = stateObj.entity_id;
  const domain = entityId.split(".")[0] ?? "";
  const deviceClass = String(stateObj.attributes.device_class ?? "").toLowerCase();
  const unit = String(stateObj.attributes.unit_of_measurement ?? "").toLowerCase();
  const name = String(stateObj.attributes.friendly_name ?? entityId).toLowerCase();

  if (domain === "binary_sensor") {
    return "binary_runtime";
  }
  if (deviceClass === "temperature" || unit === "°f" || unit === "°c") {
    return "temperature";
  }
  if (deviceClass === "humidity" || unit === "%") {
    if (name.includes("life") || name.includes("health")) {
      return "percent_health";
    }
    if (name.includes("load") || name.includes("utilization")) {
      return "percent_utilization";
    }
    return "humidity";
  }
  if (deviceClass === "power" || unit === "w" || unit === "kw") {
    return "power";
  }
  if (deviceClass === "energy" || unit === "wh" || unit === "kwh") {
    return "energy_delta";
  }
  if (deviceClass === "battery" || name.includes("battery")) {
    return "battery";
  }
  if (deviceClass === "pressure" || unit.includes("pa") || unit.includes("inh2o")) {
    return name.includes("filter") ? "filter_dp" : "auto";
  }
  if (name.includes("filter") && name.includes("life")) {
    return "filter_life";
  }
  if (name.includes("filter") && name.includes("load")) {
    return "filter_load";
  }
  if (unit === "dbm" || unit === "lqi" || unit === "db") {
    return "signal_quality";
  }

  return "auto";
}
