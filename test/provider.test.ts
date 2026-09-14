import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../src/config";
import { fetchHeatmapBuckets } from "../src/data/provider";
import type { HistoryStateRow, HomeAssistant } from "../src/types";

function historyHass(
  onCallApi: (method: string, path: string, parameters?: unknown) => void,
  rows: HistoryStateRow[][] = [[]],
): HomeAssistant {
  return {
    states: {},
    callWS: async () => {
      throw new Error("statistics unavailable");
    },
    callApi: async <T>(method: string, path: string, parameters?: unknown): Promise<T> => {
      onCallApi(method, path, parameters);
      if (parameters !== undefined) {
        // Mirrors hass.callApi + fetch(): parameters become a JSON body, and
        // GET requests with a body are rejected by the browser.
        throw new TypeError("Request with GET/HEAD method cannot have body.");
      }
      return rows as T;
    },
  };
}

function autoHass(
  statistics: () => Promise<unknown>,
  history: () => Promise<HistoryStateRow[][]> = async () => [[]],
): HomeAssistant {
  return {
    states: {},
    callWS: async <T>(): Promise<T> => (await statistics()) as T,
    callApi: async <T>(): Promise<T> => (await history()) as T,
  };
}

function autoConfig(hours = 2, rawHistoryHours = 24) {
  return normalizeConfig({
    entity: "sensor.example_power",
    range: { hours, align: "rolling" },
    bucket: { interval: "hour", value: "mean" },
    data: { provider: "auto", raw_history_hours: rawHistoryHours },
  });
}

describe("fetchHeatmapBuckets history fallback", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("encodes the history query into the path instead of a GET body", async () => {
    const calls: Array<{ method: string; path: string; parameters?: unknown }> = [];
    const hass = historyHass((method, path, parameters) => {
      calls.push({ method, path, parameters });
    });
    const config = normalizeConfig({
      entity: "sensor.example_power",
      range: { hours: 6, align: "rolling" },
      bucket: { interval: "hour", value: "mean" },
      data: { provider: "history" },
    });
    const entity = config.entities[0]!;

    const result = await fetchHeatmapBuckets(hass, config, entity);

    expect(calls).toHaveLength(1);
    const call = calls[0]!;
    expect(call.method).toBe("GET");
    expect(call.parameters).toBeUndefined();
    expect(call.path).toMatch(/^history\/period\/[^?]+\?/);
    const query = new URLSearchParams(call.path.split("?")[1] ?? "");
    expect(query.get("filter_entity_id")).toBe("sensor.example_power");
    expect(query.get("end_time")).toMatch(/Z$/);
    expect(query.has("minimal_response")).toBe(true);
    expect(query.has("no_attributes")).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it("returns aggregated buckets from the history response", async () => {
    vi.useFakeTimers();
    const now = new Date("2026-01-15T15:21:00.000Z");
    vi.setSystemTime(now);
    const bucketStart = new Date(now);
    bucketStart.setHours(bucketStart.getHours() - 1, 0, 0, 0);
    const sampleAt = (minute: number) =>
      new Date(bucketStart.getTime() + minute * 60 * 1000).toISOString();
    const rows: HistoryStateRow[][] = [
      [
        { state: "2", last_changed: sampleAt(10) },
        { state: "4", last_changed: sampleAt(20) },
      ],
    ];
    const hass = historyHass(() => undefined, rows);
    const config = normalizeConfig({
      entity: "sensor.example_power",
      range: { hours: 2, align: "rolling" },
      bucket: { interval: "hour", value: "mean" },
      data: { provider: "history" },
    });
    const entity = config.entities[0]!;

    const result = await fetchHeatmapBuckets(hass, config, entity);

    expect(result.source).toBe("history");
    expect(result.buckets.some((bucket) => bucket.value === 3)).toBe(true);
  });
});

describe("fetchHeatmapBuckets automatic provider diagnostics", () => {
  it("warns when a statistics failure falls back to successful raw history", async () => {
    const hass = autoHass(async () => {
      throw new Error("statistics unavailable; token=do-not-expose");
    });
    const config = autoConfig();

    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);

    expect(result.source).toBe("history");
    expect(result.warning).toBe("Statistics query failed. Showing raw history instead.");
    expect(result.warning).not.toContain("do-not-expose");
  });

  it("warns when the statistics response has no requested entity", async () => {
    const hass = autoHass(async () => ({}));
    const config = autoConfig();

    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);

    expect(result.source).toBe("history");
    expect(result.warning).toBe(
      "No mean statistics were available for sensor.example_power. Showing raw history instead.",
    );
  });

  it("warns when statistics rows do not contain the requested type", async () => {
    const hass = autoHass(async () => ({
      "sensor.example_power": [{ start: new Date().toISOString(), sum: 12 }],
    }));
    const config = autoConfig();

    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);

    expect(result.source).toBe("history");
    expect(result.warning).toBe(
      "No mean statistics were available for sensor.example_power. Showing raw history instead.",
    );
  });

  it("reports the statistics failure before the raw-history cap", async () => {
    let historyCalls = 0;
    const hass = autoHass(
      async () => {
        throw new Error("statistics unavailable");
      },
      async () => {
        historyCalls += 1;
        return [[]];
      },
    );
    const config = autoConfig(48, 24);

    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);

    expect(historyCalls).toBe(0);
    expect(result.warning).toBe(
      "Statistics query failed. Raw history fallback is capped at 24 hours by default. Use recorder statistics or reduce range.",
    );
  });

  it("reports missing statistics before a raw-history request failure", async () => {
    const hass = autoHass(
      async () => ({}),
      async () => {
        throw new Error("history request failed; token=do-not-expose");
      },
    );
    const config = autoConfig();

    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);

    expect(result.warning).toBe(
      "No mean statistics were available for sensor.example_power. History fallback failed.",
    );
    expect(result.warning).not.toContain("do-not-expose");
  });
});
