import { describe, expect, it } from "vitest";
import { calculateRange, estimateCellCount, normalizeConfig } from "../src/config";
import type { HomeAssistant } from "../src/types";

const hass: HomeAssistant = {
  states: {
    "sensor.room_temperature": {
      entity_id: "sensor.room_temperature",
      state: "72.1",
      attributes: {
        friendly_name: "Room Temperature",
        device_class: "temperature",
        unit_of_measurement: "°F",
      },
    },
    "sensor.example_power": {
      entity_id: "sensor.example_power",
      state: "3908",
      attributes: {
        friendly_name: "Example Power",
        device_class: "power",
        state_class: "measurement",
        unit_of_measurement: "W",
      },
    },
  },
  callWS: async <T>() => ({}) as T,
};

describe("normalizeConfig", () => {
  it("normalizes a single entity and infers metadata", () => {
    const config = normalizeConfig({ entity: "sensor.room_temperature" }, hass);

    expect(config.entities).toHaveLength(1);
    expect(config.entities[0]?.name).toBe("Room Temperature");
    expect(config.bucket.interval).toBe("day");
    expect(config.bucket.value).toBe("mean");
    expect(config.scale.preset).toBe("temperature");
  });

  it("uses Home Assistant's entity name formatter when no explicit name is configured", () => {
    const config = normalizeConfig(
      { entity: "sensor.room_temperature" },
      {
        ...hass,
        formatEntityName: (stateObj) => `Formatted ${stateObj.entity_id}`,
      },
    );

    expect(config.entities[0]?.name).toBe("Formatted sensor.room_temperature");
  });

  it("keeps explicit entity names ahead of Home Assistant's entity name formatter", () => {
    const config = normalizeConfig(
      { entities: [{ entity: "sensor.room_temperature", name: "Pinned Name" }] },
      {
        ...hass,
        formatEntityName: () => "Formatted Name",
      },
    );

    expect(config.entities[0]?.name).toBe("Pinned Name");
  });

  it("uses entities over entity when both are supplied", () => {
    const config = normalizeConfig({
      entity: "sensor.one",
      entities: ["sensor.two", { entity: "sensor.three", name: "Three" }],
    });

    expect(config.entities.map((entity) => entity.entity)).toEqual([
      "sensor.two",
      "sensor.three",
    ]);
  });

  it("keeps the explanatory axis key opt-in", () => {
    const config = normalizeConfig({
      entity: "sensor.room_temperature",
      axes: { show_key: true },
    });

    expect(config.axes.show).toBe(true);
    expect(config.axes.x_labels).toBe(true);
    expect(config.axes.y_labels).toBe(true);
    expect(config.axes.show_key).toBe(true);
    expect(normalizeConfig({ entity: "sensor.room_temperature" }).axes.show_key).toBe(false);
  });

  it("defaults recorder refresh caching and accepts explicit refresh intervals", () => {
    const defaultConfig = normalizeConfig({ entity: "sensor.room_temperature" });
    const customConfig = normalizeConfig({
      entity: "sensor.room_temperature",
      data: { refresh_interval: 30 },
    });
    const disabledRefreshConfig = normalizeConfig({
      entity: "sensor.room_temperature",
      data: { refresh_interval: -1 },
    });

    expect(defaultConfig.data.refresh_interval).toBe(300);
    expect(customConfig.data.refresh_interval).toBe(30);
    expect(disabledRefreshConfig.data.refresh_interval).toBe(0);
  });

  it("defaults live loading to lazy and globally throttled", () => {
    const defaultConfig = normalizeConfig({ entity: "sensor.room_temperature" });
    const customConfig = normalizeConfig({
      entity: "sensor.room_temperature",
      data: {
        defer_until_visible: false,
        max_concurrent_requests: 99,
      },
    });

    expect(defaultConfig.data.defer_until_visible).toBe(true);
    expect(defaultConfig.data.max_concurrent_requests).toBe(2);
    expect(customConfig.data.defer_until_visible).toBe(false);
    expect(customConfig.data.max_concurrent_requests).toBe(8);
  });

  it("defaults grid bounding to auto and accepts explicit opt-out", () => {
    const defaultConfig = normalizeConfig({ entity: "sensor.room_temperature" });
    const unboundedConfig = normalizeConfig({
      entity: "sensor.room_temperature",
      layout: { bound_to_grid: false },
    });

    expect(defaultConfig.layout.bound_to_grid).toBe("auto");
    expect(unboundedConfig.layout.bound_to_grid).toBe(false);
  });

  it("defaults to fixed day ranges and accepts rolling windows", () => {
    const defaultConfig = normalizeConfig({ entity: "sensor.room_temperature" });
    const rollingConfig = normalizeConfig({
      entity: "sensor.room_temperature",
      range: { days: 14, align: "rolling" },
    });

    expect(defaultConfig.range.align).toBe("day");
    expect(rollingConfig.range.align).toBe("rolling");
  });

  it("keeps debug logging disabled unless explicitly enabled", () => {
    expect(normalizeConfig({ entity: "sensor.room_temperature" }).debug).toBe(false);
    expect(normalizeConfig({ entity: "sensor.room_temperature", debug: true }).debug).toBe(true);
  });

  it("prefers button tabs for modest multi-entity cards", () => {
    const compact = normalizeConfig({
      entities: [
        "sensor.one",
        "sensor.two",
        "sensor.three",
        "sensor.four",
        "sensor.five",
      ],
    });
    const crowded = normalizeConfig({
      entities: [
        "sensor.one",
        "sensor.two",
        "sensor.three",
        "sensor.four",
        "sensor.five",
        "sensor.six",
        "sensor.seven",
        "sensor.eight",
        "sensor.nine",
      ],
    });

    expect(compact.navigation.mode).toBe("tabs");
    expect(crowded.navigation.mode).toBe("dropdown");
  });

  it("does not pin open-ended power scales to zero by preset", () => {
    const config = normalizeConfig({ entity: "sensor.example_power" }, hass);

    expect(config.scale.preset).toBe("power");
    expect(config.scale.min).toBeUndefined();
    expect(config.scale.max).toBeUndefined();
  });

  it("estimates hourly cells", () => {
    const config = normalizeConfig({
      entity: "sensor.room_temperature",
      range: { hours: 48 },
      bucket: { interval: "hour", value: "mean" },
    });

    expect(estimateCellCount(config, new Date("2026-05-16T12:00:00Z"))).toBe(48);
  });
});

describe("calculateRange", () => {
  it("uses explicit start and end dates", () => {
    const range = calculateRange({
      start: "2026-05-01T00:00:00Z",
      end: "2026-05-02T00:00:00Z",
      align: "rolling",
    });

    expect(range.start.toISOString()).toBe("2026-05-01T00:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-05-02T00:00:00.000Z");
  });

  it("can align day ranges to local midnight boundaries", () => {
    const range = calculateRange(
      { days: 14, align: "day" },
      new Date(2026, 4, 16, 15, 45, 30),
    );

    expect(range.start.getHours()).toBe(0);
    expect(range.start.getMinutes()).toBe(0);
    expect(range.end.getHours()).toBe(0);
    expect(range.end.getMinutes()).toBe(0);
    expect((range.end.getTime() - range.start.getTime()) / 86_400_000).toBe(14);
  });

  it("uses fixed day boundaries when alignment is omitted from card config", () => {
    const config = normalizeConfig({
      entity: "sensor.room_temperature",
      range: { hours: 24 },
      bucket: { interval: "hour", value: "mean" },
    });
    const range = calculateRange(config.range, new Date(2026, 4, 16, 15, 45, 30));

    expect(range.start.getHours()).toBe(0);
    expect(range.start.getMinutes()).toBe(0);
    expect(range.end.getHours()).toBe(0);
    expect(range.end.getMinutes()).toBe(0);
    expect((range.end.getTime() - range.start.getTime()) / 3_600_000).toBe(24);
  });
});
