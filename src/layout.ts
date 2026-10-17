import { calculateRange, estimateCellCount } from "./config";
import type { BucketInterval, DateRange, NormalizedConfig } from "./types";

export const SECTION_GRID_ROW_HEIGHT = 56;
export const SECTION_GRID_GAP = 8;
export const SECTION_DEFAULT_COLUMNS = 12;
export const SECTION_MIN_COLUMNS = 6;
export const SECTION_MIN_ROWS = 4;

const SECTION_MAX_ROWS = 12;
const REFERENCE_CARD_WIDTH = 560;
const CANVAS_GAP = 3;
const CANVAS_FIVE_MINUTE_GAP = 2;
const CANVAS_MAX_CELL = 22;
const CANVAS_VALUE_MAX_CELL = 28;
const CANVAS_LABEL_WIDTH = 58;
const CANVAS_FIVE_MINUTE_LABEL_WIDTH = 120;
const CANVAS_LABEL_HEIGHT = 18;
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const MAX_EXACT_HOURLY_ROW_SCAN = 50_000;

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
 *
 * Daily grids use a fixed 7-column weekday layout (Monday first): each bucket
 * sits in the column of its local weekday, and a new row starts whenever the
 * week wraps, so a range starting mid-week leaves the leading columns of the
 * first row blank. Monthly grids use a fixed 12-column calendar-month layout
 * with one row per local calendar year.
 *
 * Every other interval ("5minute", "week") keeps the sequential row-major
 * placement.
 */
export function placeBucketsOnGrid(
  buckets: ReadonlyArray<{ start: Date }>,
  interval: BucketInterval,
  cols = columnsForInterval(interval, Math.max(1, buckets.length)),
): GridPlacement {
  const safeCols = Math.max(1, Math.floor(cols));
  const cells: GridCell[] = [];

  if (interval === "day" || interval === "month") {
    let row = -1;
    let previousCol = -1;
    let previousYear = Number.NaN;

    buckets.forEach((bucket, index) => {
      const start = bucket.start;
      const rawCol = interval === "day" ? (start.getDay() + 6) % 7 : start.getMonth();
      const col = Math.min(safeCols - 1, Math.max(0, rawCol));
      const year = start.getFullYear();
      const newRow = interval === "day"
        ? index === 0 || col <= previousCol
        : index === 0 || year !== previousYear;
      if (newRow) {
        row += 1;
      }
      previousCol = col;
      previousYear = year;
      cells.push({ index, row, col, slot: 0, slots: 1 });
    });

    return { rows: Math.max(1, row + 1), cols: safeCols, cells };
  }

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
  now = new Date(),
): number {
  return clamp(
    sectionRowsForHeight(estimateCardHeight(config, state, now)),
    SECTION_MIN_ROWS,
    SECTION_MAX_ROWS,
  );
}

export function estimateMasonryCardSize(
  config: NormalizedConfig,
  state: CardChromeState = {},
  now = new Date(),
): number {
  return Math.max(1, Math.ceil(estimateCardHeight(config, state, now) / 50));
}

export function estimateCardHeight(
  config: NormalizedConfig,
  state: CardChromeState = {},
  now = new Date(),
): number {
  return estimateCardChromeHeight(config, state) + estimateCanvasHeight(config, REFERENCE_CARD_WIDTH, now);
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

export function estimateCanvasHeight(
  config: NormalizedConfig,
  width = REFERENCE_CARD_WIDTH,
  now = new Date(),
): number {
  const count = Math.max(1, estimateCellCount(config, now));
  const cols = columnsForInterval(config.bucket.interval, count);
  const rows = estimateGridRows(config, now);
  const { cell, gap } = fitCanvasColumns({
    width, cols, interval: config.bucket.interval,
    labelWidth: config.axes.show && config.axes.y_labels ? rowLabelWidthForInterval(config.bucket.interval) : 0,
    reserveValues: config.tiles.show_values || config.tiles.show_value_toggle,
  });
  const labelHeight = config.axes.show && config.axes.x_labels ? CANVAS_LABEL_HEIGHT : 0;

  return labelHeight + rows * cell + Math.max(0, rows - 1) * gap;
}

/** One logical pixel per column even below the densest grid's supported width. */
export function canvasWidthForContainer(width: number): number {
  return Math.max(48, Math.floor(width));
}

/** Share the width fit between the renderer and height estimates. */
export function fitCanvasColumns(options: {
  width: number;
  cols: number;
  interval: BucketInterval;
  labelWidth: number;
  reserveValues: boolean;
}): { width: number; cell: number; gap: number; labelWidth: number } {
  const { cols, interval } = options;
  const width = canvasWidthForContainer(options.width);
  // Preserve color-bearing pixels before decorative gaps at narrow widths.
  const gaplessCell = Math.floor(Math.max(0, width - options.labelWidth) / cols);
  const gap = Math.min(
    canvasGapForInterval(interval),
    Math.floor(gaplessCell / 3),
    Math.floor(Math.max(0, width - cols) / Math.max(1, cols - 1)),
  );
  const gapsWidth = Math.max(0, cols - 1) * gap;
  const labelWidth = Math.min(options.labelWidth, Math.max(0, width - cols - gapsWidth));
  const maxCell = options.reserveValues ? CANVAS_VALUE_MAX_CELL : CANVAS_MAX_CELL;
  // Value labels already degrade at small sizes. A preferred minimum must
  // never push the grid beyond the actual bitmap.
  const cell = Math.max(1, Math.min(maxCell, Math.floor((width - labelWidth - gapsWidth) / cols)));
  return { width, cell, gap, labelWidth };
}

export function estimateGridRows(config: NormalizedConfig, now: Date): number {
  const count = Math.max(1, estimateCellCount(config, now));
  const cols = columnsForInterval(config.bucket.interval, count);
  switch (config.bucket.interval) {
    case "hour":
      return countHourlyGridRows(calculateRange(config.range, now));
    case "day":
      return countDailyGridRows(calculateRange(config.range, now));
    case "month":
      return countMonthlyGridRows(calculateRange(config.range, now));
    default:
      return Math.ceil(count / cols);
  }
}

/**
 * Counts the Monday-anchored local weeks touched by the day buckets of a range,
 * i.e. the rows placeBucketsOnGrid renders for a daily grid.
 */
export function countDailyGridRows(range: DateRange): number {
  const firstDay = localCalendarDayTimestamp(range.start);
  const lastDay = localCalendarDayTimestamp(new Date(range.end.getTime() - 1));
  const firstMonday = mondayOfCalendarDay(firstDay);
  const lastMonday = mondayOfCalendarDay(lastDay);
  return Math.max(1, Math.floor((lastMonday - firstMonday) / (7 * DAY_MS)) + 1);
}

/**
 * Counts the local calendar years touched by the month buckets of a range,
 * i.e. the rows placeBucketsOnGrid renders for a monthly grid.
 */
export function countMonthlyGridRows(range: DateRange): number {
  const firstYear = range.start.getFullYear();
  const lastYear = new Date(range.end.getTime() - 1).getFullYear();
  return Math.max(1, lastYear - firstYear + 1);
}

export function countHourlyGridRows(range: DateRange): number {
  const first = range.start;
  const last = new Date(range.end.getTime() - 1);
  const firstDay = localCalendarDayTimestamp(first);
  const lastDay = localCalendarDayTimestamp(last);
  const calendarSpan = Math.max(1, Math.floor((lastDay - firstDay) / DAY_MS) + 1);
  const estimatedHours = Math.ceil((range.end.getTime() - range.start.getTime()) / HOUR_MS) + 1;
  if (estimatedHours > MAX_EXACT_HOURLY_ROW_SCAN) {
    return calendarSpan;
  }

  const cursor = new Date(range.start);
  cursor.setMilliseconds(0);
  cursor.setSeconds(0);
  cursor.setMinutes(0);
  let previousDay = "";
  let rows = 0;

  while (cursor < range.end) {
    const next = cursor.getTime() + HOUR_MS;
    if (next > range.start.getTime()) {
      const day = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
      if (day !== previousDay) {
        previousDay = day;
        rows += 1;
      }
    }
    cursor.setTime(next);
  }

  return Math.max(1, rows);
}

function localCalendarDayTimestamp(date: Date): number {
  const day = new Date(0);
  day.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  day.setUTCHours(0, 0, 0, 0);
  return day.getTime();
}

/** Returns the Monday that starts the week of a localCalendarDayTimestamp value. */
function mondayOfCalendarDay(dayTimestamp: number): number {
  const weekday = (new Date(dayTimestamp).getUTCDay() + 6) % 7;
  return dayTimestamp - weekday * DAY_MS;
}

export function rowLabelWidthForInterval(interval: BucketInterval): number {
  return interval === "5minute" ? CANVAS_FIVE_MINUTE_LABEL_WIDTH : CANVAS_LABEL_WIDTH;
}

export function canvasGapForInterval(interval: BucketInterval): number {
  return interval === "5minute" ? CANVAS_FIVE_MINUTE_GAP : CANVAS_GAP;
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
