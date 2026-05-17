export const CARD_TAG = "universal-heatmap-card";
export const CARD_NAME = "Universal Heatmap Card";
export const CARD_VERSION = "0.1.1";

export type BucketInterval = "5minute" | "hour" | "day" | "week" | "month";
export type BucketValueName =
  | "mean"
  | "min"
  | "max"
  | "last"
  | "state"
  | "sum"
  | "delta"
  | "change"
  | "count"
  | "percent_on"
  | "duration_on";

export type DataProviderName = "auto" | "statistics" | "history";
export type MissingMode = "empty" | "zero" | "carry_forward";
export type LayoutMode = "auto" | "calendar" | "day_hour" | "compact";
export type NavigationMode = "tabs" | "arrows" | "dropdown" | "dots";
export type RangeAlignment = "rolling" | "day";
export type Quality = "ok" | "missing" | "carried" | "clipped" | "error";
export type BucketSource = "statistics" | "history" | "current";

export interface HeatmapEntityConfig {
  entity: string;
  name?: string;
  icon?: string;
  scale?: ScaleConfig;
}

export interface RangeConfig {
  hours?: number;
  days?: number;
  start?: string;
  end?: string;
  align?: RangeAlignment;
}

export interface BucketConfig {
  interval?: BucketInterval;
  value?: BucketValueName;
}

export interface DataConfig {
  provider?: DataProviderName;
  prefetch?: boolean;
  max_cells?: number;
  raw_history_hours?: number;
  refresh_interval?: number;
  defer_until_visible?: boolean;
  max_concurrent_requests?: number;
}

export interface MissingConfig {
  mode?: MissingMode;
}

export interface ColorStop {
  value: number;
  color: string;
  label?: string;
}

export interface ScaleConfig {
  preset?: string;
  min?: number;
  max?: number;
  unit?: string;
  invert?: boolean;
  ignore_zero?: boolean | "auto";
  outlier_clip?: number | [number, number];
  sensitivity?: number;
  stops?: ColorStop[];
}

export interface LayoutConfig {
  mode?: LayoutMode;
  bound_to_grid?: boolean | "auto";
}

export interface NavigationConfig {
  mode?: NavigationMode;
}

export interface LegendConfig {
  show?: boolean;
}

export interface TooltipConfig {
  show?: boolean;
}

export interface AxesConfig {
  show?: boolean;
  x_labels?: boolean;
  y_labels?: boolean;
  show_key?: boolean;
}

export interface HeatmapCardConfig {
  type?: string;
  title?: string;
  entity?: string;
  entities?: Array<string | HeatmapEntityConfig>;
  grid_options?: {
    rows?: number;
    columns?: number;
    min_rows?: number;
    min_columns?: number;
  };
  debug?: boolean;
  range?: RangeConfig;
  bucket?: BucketConfig;
  data?: DataConfig;
  missing?: MissingConfig;
  scale?: ScaleConfig;
  layout?: LayoutConfig;
  navigation?: NavigationConfig;
  axes?: AxesConfig;
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
}

export interface NormalizedEntityConfig extends HeatmapEntityConfig {
  name: string;
}

export interface NormalizedRangeConfig {
  hours?: number;
  days?: number;
  start?: string;
  end?: string;
  align: RangeAlignment;
}

export interface NormalizedBucketConfig {
  interval: BucketInterval;
  value: BucketValueName;
}

export interface NormalizedDataConfig {
  provider: DataProviderName;
  prefetch: boolean;
  max_cells: number;
  raw_history_hours: number;
  refresh_interval: number;
  defer_until_visible: boolean;
  max_concurrent_requests: number;
}

export interface NormalizedConfig {
  title?: string;
  debug: boolean;
  entities: NormalizedEntityConfig[];
  range: NormalizedRangeConfig;
  bucket: NormalizedBucketConfig;
  data: NormalizedDataConfig;
  missing: Required<MissingConfig>;
  scale: ScaleConfig;
  layout: Required<LayoutConfig>;
  navigation: Required<NavigationConfig>;
  axes: Required<AxesConfig>;
  legend: Required<LegendConfig>;
  tooltip: Required<TooltipConfig>;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BucketWindow {
  start: Date;
  end: Date;
}

export interface BucketValue extends BucketWindow {
  value: number | null;
  quality: Quality;
  source: BucketSource;
}

export interface ProviderResult {
  buckets: BucketValue[];
  source: BucketSource;
  warning?: string;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed?: string;
  last_updated?: string;
  attributes: Record<string, unknown>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callWS<T = unknown>(message: Record<string, unknown>): Promise<T>;
  callApi?<T = unknown>(
    method: string,
    path: string,
    parameters?: Record<string, string | number | boolean>,
  ): Promise<T>;
  formatEntityState?: (stateObj: HassEntity) => string;
  formatEntityName?: (stateObj: HassEntity) => string;
  locale?: {
    language?: string;
  };
}

export interface StatisticsRow {
  start?: string | number;
  end?: string | number;
  mean?: number | null;
  min?: number | null;
  max?: number | null;
  state?: number | null;
  sum?: number | null;
  change?: number | null;
}

export interface HistoryStateRow {
  state: string;
  last_changed?: string;
  last_updated?: string;
}

export interface ScaleModel {
  min: number;
  max: number;
  unit?: string;
  sensitivity: number;
  stops: ColorStop[];
  clippedLow: boolean;
  clippedHigh: boolean;
}

export interface HeatmapRenderLayout {
  cols: number;
  rows: number;
  cell: number;
  gap: number;
  width: number;
  height: number;
  gridX: number;
  gridY: number;
  gridWidth: number;
  gridHeight: number;
}

export interface TooltipState {
  x: number;
  y: number;
  bucket: BucketValue;
  label: string;
}
