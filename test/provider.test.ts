import { describe, expect, it } from "vitest";
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

describe("fetchHeatmapBuckets history fallback", () => {
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
    const now = Date.now();
    const rows: HistoryStateRow[][] = [
      [
        { state: "2", last_changed: new Date(now - 30 * 60 * 1000).toISOString() },
        { state: "4", last_changed: new Date(now - 20 * 60 * 1000).toISOString() },
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
