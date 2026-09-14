import { estimateCellCount } from "./config";
import type { BucketInterval, NormalizedConfig } from "./types";

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
const CANVAS_VALUE_MIN_CELL = 14;
const CANVAS_VALUE_MAX_CELL = 28;
const CANVAS_LABEL_WIDTH = 58;
const CANVAS_LABEL_HEIGHT = 18;

interface CardChromeState {
  loading?: boolean;
  warning?: boolean;
  error?: boolean;
}

export interface GridCell {
  /** Index of the bucket this cell renders. */
  index: number;
  /** Grid row the cell belongs to (one local calendar day for hourly grids). */
  row: number;
  /** Grid column the cell belongs to (wall-clock hour for hourly grids). */
  col: number;
  /** Position of this cell inside a column shared by repeated wall-clock hours. */
  slot: number;
  /** Number of cells sharing the column, i.e. 2 for a repeated fall-back hour. */
  slots: number;
}

export interface GridPlacement {
  rows: number;
  cols: number;
  cells: GridCell[];
}

/**
 * Maps buckets onto the render grid.
 *
 * Hourly grids use a fixed 24-column wall-clock layout: buckets are grouped by
 * local calendar day (one row per day) and placed in the column of their local
 * hour. That keeps 23-hour and 25-hour DST days intact - the nonexistent
 * spring-forward hour simply leaves its column blank, and the two fall-back
 * 01:00 hours stay separate logical cells sharing (splitting) one column.
 * Every other interval keeps the sequential row-major placement.
 */
export function placeBucketsOnGrid(
  buckets: ReadonlyArray<{ start: Date }>,
  interval: BucketInterval,
  cols = columnsForInterval(interval, Math.max(1, buckets.length)),
): GridPlacement {
  const safeCols = Math.max(1, Math.floor(cols));
  const cells: GridCell[] = [];

  if (interval !== "hour") {
    buckets.forEach((_bucket, index) => {
      cells.push({
        index,
        row: Math.floor(index / safeCols),
        col: index % safeCols,
        slot: 0,
        slots: 1,
      });
    });
    return { rows: Math.max(1, Math.ceil(buckets.length / safeCols)), cols: safeCols, cells };
  }

  const slotCounts = new Map<number, number>();
  let row = -1;
  let dayKey = "";

  buckets.forEach((bucket, index) => {
    const start = bucket.start;
    const key = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
    if (key !== dayKey) {
      dayKey = key;
      row += 1;
    }
    const col = Math.min(safeCols - 1, Math.max(0, start.getHours()));
    const slotKey = row * safeCols + col;
    const slot = slotCounts.get(slotKey) ?? 0;
    slotCounts.set(slotKey, slot + 1);
    cells.push({ index, row, col, slot, slots: 1 });
  });

  for (const cell of cells) {
    cell.slots = slotCounts.get(cell.row * safeCols + cell.col) ?? 1;
  }

  return { rows: Math.max(1, row + 1), cols: safeCols, cells };
}

/** Formats a date's local UTC offset, used to disambiguate repeated DST hours. */
export function utcOffsetLabel(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes < 0 ? "-" : "+";
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${minutes}`;
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
  const reservesValues = config.tiles.show_values || config.tiles.show_value_toggle;
  const minCell = reservesValues ? CANVAS_VALUE_MIN_CELL : CANVAS_MIN_CELL;
  const maxCell = reservesValues ? CANVAS_VALUE_MAX_CELL : CANVAS_MAX_CELL;
  const cell = Math.max(
    minCell,
    Math.min(
      maxCell,
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

export function columnsForInterval(interval: NormalizedConfig["bucket"]["interval"], count: number): number {
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
