import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import {
  estimateCanvasHeight,
  estimateMasonryCardSize,
  estimateSectionGridRows,
  sectionRowsForHeight,
  sectionSpanHeight,
} from "../src/layout";

describe("sections layout estimates", () => {
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
