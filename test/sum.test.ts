import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import {
  generateBucketWindows,
  historyRowsToBuckets,
  statisticsRowsToBuckets,
  statisticsTypeForValue,
} from "../src/data/buckets";
import { fetchHeatmapBuckets } from "../src/data/provider";
import type { HomeAssistant } from "../src/types";

const range = {
  start: new Date("2026-05-01T00:00:00Z"),
  end: new Date("2026-05-01T03:00:00Z"),
};

function sumConfig(provider: "statistics" | "auto" | "history") {
  return normalizeConfig({
    entity: "sensor.example_energy",
    range: { start: range.start.toISOString(), end: range.end.toISOString() },
    bucket: { interval: "hour", value: "sum" },
    data: { provider, raw_history_hours: 24 },
  });
}

describe("per-bucket sum semantics", () => {
  it("requests recorder change for sum without changing other supported statistics", () => {
    expect(statisticsTypeForValue("sum")).toBe("change");
    expect(statisticsTypeForValue("last")).toBe("state");
    for (const value of ["mean", "min", "max", "state", "change"] as const) {
      expect(statisticsTypeForValue(value)).toBe(value);
    }
  });

  it("uses each recorder change including after a cumulative meter reset", () => {
    const windows = generateBucketWindows(range, "hour");
    const buckets = statisticsRowsToBuckets(
      windows,
      [
        { start: windows[0]!.start.toISOString(), sum: 1000, change: 2 },
        { start: windows[1]!.start.toISOString(), sum: 1, change: 3 },
        { start: windows[2]!.start.toISOString(), sum: 1, change: 0 },
      ],
      "sum",
      "empty",
    );
    expect(buckets.map((bucket) => bucket.value)).toEqual([2, 3, 0]);
    expect(buckets.every((bucket) => bucket.quality === "ok")).toBe(true);
  });

  it("does not substitute a lifetime sum when recorder change is missing", () => {
    const windows = generateBucketWindows(range, "hour");
    const buckets = statisticsRowsToBuckets(
      windows,
      [{ start: windows[0]!.start.toISOString(), sum: 1000 }],
      "sum",
      "empty",
    );
    expect(buckets.every((bucket) => bucket.value === null)).toBe(true);
    expect(buckets.every((bucket) => bucket.quality === "missing")).toBe(true);
  });

  it("keeps raw-history sum as the sum of numeric samples, not a meter delta", () => {
    const windows = generateBucketWindows(range, "hour");
    const buckets = historyRowsToBuckets(
      windows,
      [
        { state: "100", last_changed: "2026-05-01T00:05:00Z" },
        { state: "103", last_changed: "2026-05-01T00:55:00Z" },
        { state: "0", last_changed: "2026-05-01T01:05:00Z" },
      ],
      "sum",
      "empty",
    );
    expect(buckets.map((bucket) => bucket.value)).toEqual([203, 0, null]);
  });

  it("requests and displays recorder change through the public statistics provider", async () => {
    const calls: unknown[] = [];
    const hass: HomeAssistant = {
      states: {},
      callWS: async <T>(message: unknown): Promise<T> => {
        calls.push(message);
        return {
          "sensor.example_energy": [{ start: range.start.toISOString(), sum: 1000, change: 2 }],
        } as T;
      },
    };
    const config = sumConfig("statistics");
    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      type: "recorder/statistics_during_period",
      statistic_ids: ["sensor.example_energy"],
      period: "hour",
      types: ["change"],
    });
    expect(result.source).toBe("statistics");
    expect(result.buckets.map((bucket) => bucket.value)).toEqual([2, null, null]);
  });

  it("falls back to sample sum with a warning when change is unavailable", async () => {
    const hass: HomeAssistant = {
      states: {},
      callWS: async <T>(): Promise<T> => ({
        "sensor.example_energy": [{ start: range.start.toISOString(), sum: 1000 }],
      }) as T,
      callApi: async <T>(): Promise<T> => [[
        { state: "100", last_changed: "2026-05-01T00:05:00Z" },
        { state: "103", last_changed: "2026-05-01T00:55:00Z" },
      ]] as T,
    };
    const config = sumConfig("auto");
    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);
    expect(result.source).toBe("history");
    expect(result.warning).toBe(
      "No sum statistics were available for sensor.example_energy. Showing raw history instead.",
    );
    expect(result.buckets.map((bucket) => bucket.value)).toEqual([203, null, null]);
  });
});
