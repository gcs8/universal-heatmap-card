import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { calculateRange, normalizeConfig } from "../src/config";
import { generateBucketWindows } from "../src/data/buckets";
import {
  estimateCanvasHeight,
  estimateGridRows,
  estimateMasonryCardSize,
  estimateSectionGridRows,
  placeBucketsOnGrid,
  rowLabelWidthForInterval,
  sectionRowsForHeight,
  sectionSpanHeight,
  utcOffsetLabel,
} from "../src/layout";

describe("sections layout estimates", () => {
  it("reserves a wider gutter for dated 5-minute row start labels", () => {
    expect(rowLabelWidthForInterval("5minute")).toBe(82);
    expect(rowLabelWidthForInterval("hour")).toBe(58);
  });

  it("uses Home Assistant's documented section row math", () => {
    expect(sectionSpanHeight(1)).toBe(56);
    expect(sectionSpanHeight(5)).toBe(312);
    expect(sectionRowsForHeight(312)).toBe(5);
    expect(sectionRowsForHeight(313)).toBe(6);
  });

  it("estimates hourly section cards from rendered content height", () => {
    const config = normalizeConfig({
      entities: [
        "sensor.room_temperature",
        "sensor.room_temperature_2",
        "sensor.room_temperature_3",
        "sensor.room_temperature_4",
      ],
      range: { days: 14 },
      bucket: { interval: "hour", value: "mean" },
      scale: { preset: "temperature" },
      navigation: { mode: "tabs" },
    });

    expect(estimateSectionGridRows(config)).toBe(9);
  });

  it("keeps daily diagnostic cards shorter than dense hourly cards", () => {
    const daily = normalizeConfig({
      entity: "sensor.attic_temp_sensor_battery",
      range: { days: 30 },
      bucket: { interval: "day", value: "mean" },
      scale: { preset: "battery" },
    });
    const hourly = normalizeConfig({
      entity: "sensor.room_temperature",
      range: { days: 14 },
      bucket: { interval: "hour", value: "mean" },
      scale: { preset: "temperature" },
    });

    expect(estimateSectionGridRows(daily)).toBeLessThan(estimateSectionGridRows(hourly));
    expect(estimateMasonryCardSize(hourly)).toBeGreaterThan(estimateSectionGridRows(hourly));
  });

  it("reserves larger cells when tile values are enabled", () => {
    const plain = normalizeConfig({
      entity: "sensor.room_temperature",
      range: { days: 30 },
      bucket: { interval: "day", value: "mean" },
      scale: { preset: "temperature" },
    });
    const withValues = normalizeConfig({
      entity: "sensor.room_temperature",
      range: { days: 30 },
      bucket: { interval: "day", value: "mean" },
      scale: { preset: "temperature" },
      tiles: { show_values: true },
    });

    expect(estimateCanvasHeight(withValues, 640)).toBeGreaterThan(estimateCanvasHeight(plain, 640));
    expect(estimateMasonryCardSize(withValues)).toBeGreaterThanOrEqual(estimateMasonryCardSize(plain));
  });

  it("reserves value-label room when the on-card toggle is enabled", () => {
    const plain = normalizeConfig({
      entity: "sensor.room_temperature",
      range: { days: 30 },
      bucket: { interval: "day", value: "mean" },
      scale: { preset: "temperature" },
    });
    const withToggle = normalizeConfig({
      entity: "sensor.room_temperature",
      range: { days: 30 },
      bucket: { interval: "day", value: "mean" },
      scale: { preset: "temperature" },
      tiles: { show_value_toggle: true },
    });

    expect(estimateCanvasHeight(withToggle, 640)).toBeGreaterThan(estimateCanvasHeight(plain, 640));
  });
});

describe("hour grid placement across DST transitions (America/New_York)", () => {
  const originalTz = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = "America/New_York";
  });

  afterAll(() => {
    process.env.TZ = originalTz;
  });

  function hourBuckets(startIso: string, count: number): Array<{ start: Date }> {
    const startMs = new Date(startIso).getTime();
    return Array.from({ length: count }, (_, index) => ({
      start: new Date(startMs + index * 3_600_000),
    }));
  }

  it("estimates the same two rows rendered by a rolling 24-hour window crossing midnight", () => {
    const now = new Date(2026, 4, 2, 12, 0, 0, 0);
    const config = normalizeConfig({
      entity: "sensor.room_temperature",
      range: { hours: 24, align: "rolling" },
      bucket: { interval: "hour", value: "mean" },
    });
    const windows = generateBucketWindows(calculateRange(config.range, now), "hour");
    const rendered = placeBucketsOnGrid(windows, "hour");

    expect(rendered.rows).toBe(2);
    expect(estimateGridRows(config, now)).toBe(rendered.rows);
    expect(estimateCanvasHeight(config, 560, now)).toBe(57);
  });

  it("estimates the same single row rendered by a 25-hour fall-back day", () => {
    const now = new Date(2026, 10, 1, 12, 0, 0, 0);
    const config = normalizeConfig({
      entity: "sensor.room_temperature",
      range: { start: "2026-11-01", end: "2026-11-02", align: "rolling" },
      bucket: { interval: "hour", value: "mean" },
    });
    const windows = generateBucketWindows(calculateRange(config.range, now), "hour");
    const rendered = placeBucketsOnGrid(windows, "hour");

    expect(windows).toHaveLength(25);
    expect(rendered.rows).toBe(1);
    expect(estimateGridRows(config, now)).toBe(rendered.rows);
    expect(estimateCanvasHeight(config, 560, now)).toBe(36);
  });

  it("leaves the nonexistent spring-forward 2am column blank", () => {
    const placement = placeBucketsOnGrid(hourBuckets("2026-03-08T05:00:00Z", 23), "hour");

    expect(placement.rows).toBe(1);
    expect(placement.cols).toBe(24);
    expect(placement.cells).toHaveLength(23);
    expect(placement.cells.map((cell) => cell.col)).not.toContain(2);
    expect(placement.cells.every((cell) => cell.row === 0 && cell.slots === 1)).toBe(true);
    expect(placement.cells[1]).toMatchObject({ index: 1, col: 1 });
    expect(placement.cells[2]).toMatchObject({ index: 2, col: 3 });
    expect(placement.cells[22]).toMatchObject({ index: 22, col: 23 });
  });

  it("splits the repeated fall-back 1am hour into two logical cells", () => {
    const placement = placeBucketsOnGrid(hourBuckets("2026-11-01T04:00:00Z", 25), "hour");

    expect(placement.rows).toBe(1);
    expect(placement.cells).toHaveLength(25);
    const oneAm = placement.cells.filter((cell) => cell.col === 1);
    expect(oneAm).toHaveLength(2);
    expect(oneAm[0]).toMatchObject({ index: 1, slot: 0, slots: 2 });
    expect(oneAm[1]).toMatchObject({ index: 2, slot: 1, slots: 2 });
    expect(new Set(placement.cells.map((cell) => cell.col)).size).toBe(24);
  });

  it("does not shift later days after a spring-forward day", () => {
    const placement = placeBucketsOnGrid(hourBuckets("2026-03-07T05:00:00Z", 71), "hour");

    expect(placement.rows).toBe(3);
    expect(placement.cells[47]).toMatchObject({ row: 2, col: 0 });
    expect(placement.cells[70]).toMatchObject({ row: 2, col: 23 });
    expect(placement.cells.filter((cell) => cell.row === 1)).toHaveLength(23);
  });

  it("keeps sequential placement for non-hourly intervals", () => {
    const placement = placeBucketsOnGrid(
      Array.from({ length: 9 }, (_, index) => ({ start: new Date(2026, 4, 1 + index) })),
      "day",
    );

    expect(placement.cols).toBe(7);
    expect(placement.rows).toBe(2);
    expect(placement.cells[7]).toMatchObject({ row: 1, col: 0, slot: 0, slots: 1 });
  });

  it("labels the UTC offset of a bucket for repeated-hour tooltips", () => {
    expect(utcOffsetLabel(new Date("2026-11-01T05:00:00Z"))).toBe("UTC-04:00");
    expect(utcOffsetLabel(new Date("2026-11-01T06:00:00Z"))).toBe("UTC-05:00");
  });
});
