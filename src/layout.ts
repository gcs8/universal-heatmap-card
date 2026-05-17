import { estimateCellCount } from "./config";
import type { NormalizedConfig } from "./types";

export const SECTION_GRID_ROW_HEIGHT = 56;
export const SECTION_GRID_GAP = 8;
export const SECTION_DEFAULT_COLUMNS = 12;
export const SECTION_MIN_COLUMNS = 6;
export const SECTION_MIN_ROWS = 4;

const SECTION_MAX_ROWS = 12;
const REFERENCE_CARD_WIDTH = 560;
const CANVAS_GAP = 3;
const CANVAS_MIN_CELL = 7;
const CANVAS_MAX_CELL = 22;
const CANVAS_LABEL_WIDTH = 58;
const CANVAS_LABEL_HEIGHT = 18;

interface CardChromeState {
  loading?: boolean;
  warning?: boolean;
  error?: boolean;
}

export function sectionSpanHeight(rows: number): number {
  const safeRows = Math.max(1, Math.floor(rows));
  return safeRows * SECTION_GRID_ROW_HEIGHT + Math.max(0, safeRows - 1) * SECTION_GRID_GAP;
}

export function sectionRowsForHeight(height: number): number {
  if (!Number.isFinite(height) || height <= 0) {
    return SECTION_MIN_ROWS;
  }
  return Math.ceil((height + SECTION_GRID_GAP) / (SECTION_GRID_ROW_HEIGHT + SECTION_GRID_GAP));
}

export function estimateSectionGridRows(
  config: NormalizedConfig,
  state: CardChromeState = {},
): number {
  return clamp(
    sectionRowsForHeight(estimateCardHeight(config, state)),
    SECTION_MIN_ROWS,
    SECTION_MAX_ROWS,
  );
}

export function estimateMasonryCardSize(
  config: NormalizedConfig,
  state: CardChromeState = {},
): number {
  return Math.max(1, Math.ceil(estimateCardHeight(config, state) / 50));
}

export function estimateCardHeight(
  config: NormalizedConfig,
  state: CardChromeState = {},
): number {
  return estimateCardChromeHeight(config, state) + estimateCanvasHeight(config);
}

export function estimateCardChromeHeight(
  config: NormalizedConfig,
  state: CardChromeState = {},
): number {
  let height = 58; // Header title/subtitle row with padding.
  height += 16; // Body bottom padding.

  if (config.entities.length > 1) {
    height += estimateNavigationHeight(config);
  }
  if (state.loading || state.warning || state.error) {
    height += 33; // Compact status row plus its margin.
  }
  if (config.axes.show_key) {
    height += 24;
  }

  height += 25; // Low/high/latest summary row.
  if (config.legend.show) {
    height += 25;
  }

  return height;
}

export function estimateCanvasHeight(config: NormalizedConfig, width = REFERENCE_CARD_WIDTH): number {
  const count = Math.max(1, estimateCellCount(config));
  const cols = columnsForInterval(config.bucket.interval, count);
  const rows = Math.ceil(count / cols);
  const labelWidth = config.axes.show && config.axes.y_labels ? CANVAS_LABEL_WIDTH : 0;
  const labelHeight = config.axes.show && config.axes.x_labels ? CANVAS_LABEL_HEIGHT : 0;
  const gridWidth = Math.max(160, width - labelWidth);
  const cell = Math.max(
    CANVAS_MIN_CELL,
    Math.min(
      CANVAS_MAX_CELL,
      Math.floor((gridWidth - Math.max(0, cols - 1) * CANVAS_GAP) / cols),
    ),
  );

  return labelHeight + rows * cell + Math.max(0, rows - 1) * CANVAS_GAP;
}

function estimateNavigationHeight(config: NormalizedConfig): number {
  switch (config.navigation.mode) {
    case "dots":
      return 24;
    case "tabs": {
      const tabsPerRow = 3;
      const tabRows = Math.max(1, Math.ceil(config.entities.length / tabsPerRow));
      return tabRows * 32 + Math.max(0, tabRows - 1) * 8 + 10;
    }
    case "arrows":
    case "dropdown":
    default:
      return 42;
  }
}

function columnsForInterval(interval: NormalizedConfig["bucket"]["interval"], count: number): number {
  if (interval === "hour") {
    return 24;
  }
  if (interval === "5minute") {
    return 48;
  }
  if (interval === "day") {
    return 7;
  }
  if (interval === "month") {
    return 12;
  }
  return Math.min(12, Math.ceil(Math.sqrt(count * 1.8)));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
