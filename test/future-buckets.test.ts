import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateRange, normalizeConfig } from "../src/config";
import { applyMissingMode, emptyBuckets, historyRowsToBuckets, statisticsRowsToBuckets } from "../src/data/buckets";
import { fetchHeatmapBuckets } from "../src/data/provider";
import type { BucketValue, HomeAssistant, MissingMode } from "../src/types";

const entity = "sensor.example";
const local = (day: number, hour = 0, minute = 0) => new Date(2030, 0, day, hour, minute);
const paths = ["statistics", "auto-statistics", "history", "auto-empty", "auto-failure"] as const;
const modes = ["zero", "carry_forward"] as const;

afterEach(() => vi.useRealTimers());

function fixture(path: typeof paths[number], observed: Date[], delay = false) {
  const callWS = vi.fn(async (_message: unknown) => {
    if (delay) vi.setSystemTime(local(17, 12));
    if (path === "auto-failure") throw new Error("statistics unavailable");
    return path === "auto-empty" ? {} : {
      [entity]: observed.map((at) => ({ start: at.toISOString(), mean: 7 })),
    };
  });
  const callApi = vi.fn(async (_method: string, _path: string) => {
    if (delay) vi.setSystemTime(local(17, 12));
    return [observed.map((at) => ({ state: "7", last_changed: at.toISOString() }))];
  });
  const hass: HomeAssistant = {
    states: {},
    callWS: async <T>(message: unknown) => await callWS(message) as T,
    callApi: async <T>(method: string, path: string) => await callApi(method, path) as T,
  };
  return { hass, callWS, callApi };
}

function at(buckets: BucketValue[], day: number, hour: number) {
  const bucket = buckets.find((bucket) => bucket.start.getTime() === local(day, hour).getTime());
  expect(bucket).toBeDefined();
  return bucket!;
}

function configFor(path: typeof paths[number], mode: MissingMode) {
  return normalizeConfig({
    entity,
    range: { days: 2 },
    bucket: { interval: "hour", value: "mean" },
    data: { provider: path.startsWith("auto") ? "auto" : path as "history" | "statistics", raw_history_hours: 48 },
    missing: { mode },
  });
}

describe.each(paths)("future missing buckets via %s", (path) => {
  it.each(modes)("keeps historical and in-progress %s fills but leaves future missing", async (mode) => {
    vi.useFakeTimers();
    const now = local(15, 15, 30);
    vi.setSystemTime(now);
    const { hass } = fixture(path, [local(14, 12), local(15, 14)]);
    const config = configFor(path, mode);
    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);
    expect(result.source).toBe(path.includes("statistics") ? "statistics" : "history");
    expect(at(result.buckets, 14, 12)).toMatchObject({ value: 7, quality: "ok" });
    expect(at(result.buckets, 15, 14)).toMatchObject({ value: 7, quality: "ok" });
    for (const [day, hour] of [[14, 13], [15, 13], [15, 15]]) {
      expect(at(result.buckets, day!, hour!)).toMatchObject({
        value: mode === "zero" ? 0 : 7,
        quality: mode === "zero" ? "ok" : "carried",
      });
    }
    const future = result.buckets.filter((bucket) => bucket.start.getTime() >= now.getTime());
    expect(future).toHaveLength(8);
    expect(future.every((bucket) => bucket.value === null && bucket.quality === "missing")).toBe(true);
    expect(result.buckets.filter((bucket) => bucket.value !== null).at(-1)?.start).toEqual(local(15, 15));
  });

  it.each(modes)("treats start equal to now as future under %s", async (mode) => {
    vi.useFakeTimers();
    vi.setSystemTime(local(15, 15));
    const { hass } = fixture(path, [local(15, 14)]);
    const config = configFor(path, mode);
    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);
    expect(at(result.buckets, 15, 15)).toMatchObject({ value: null, quality: "missing" });
    expect(result.buckets.filter((bucket) => bucket.value !== null).at(-1)?.start).toEqual(local(15, 14));
  });

  it.each(modes)("preserves finite observed future data without filling later gaps under %s", async (mode) => {
    vi.useFakeTimers();
    vi.setSystemTime(local(15, 15, 30));
    const { hass } = fixture(path, [local(15, 14), local(15, 17)]);
    const config = configFor(path, mode);
    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);
    expect(at(result.buckets, 15, 17)).toMatchObject({ value: 7, quality: "ok" });
    expect(at(result.buckets, 15, 16)).toMatchObject({ value: null, quality: "missing" });
    expect(at(result.buckets, 15, 18)).toMatchObject({ value: null, quality: "missing" });
  });

  it.each(modes)("uses fetch-time cutoff despite delayed queries under %s", async (mode) => {
    vi.useFakeTimers();
    vi.setSystemTime(local(15, 15, 30));
    const { hass, callWS, callApi } = fixture(path, [local(15, 14)], true);
    const config = configFor(path, mode);
    const expectedRange = calculateRange(config.range);
    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);
    expect(at(result.buckets, 15, 15).value).toBe(mode === "zero" ? 0 : 7);
    expect(at(result.buckets, 15, 16)).toMatchObject({ value: null, quality: "missing" });
    if (path !== "history") {
      expect(callWS).toHaveBeenCalledWith(expect.objectContaining({
        start_time: expectedRange.start.toISOString(), end_time: expectedRange.end.toISOString(),
      }));
    }
    if (result.source === "history") {
      expect(callApi).toHaveBeenCalledTimes(1);
      const [method, request] = callApi.mock.calls[0]!;
      expect(method).toBe("GET");
      expect(request.split("?")[0]).toBe(`history/period/${expectedRange.start.toISOString()}`);
      expect(new URLSearchParams(request.split("?")[1]).get("end_time")).toBe(expectedRange.end.toISOString());
    }
  });
});

describe("pure row helpers use the current cutoff by default", () => {
  it.each(modes)("handles an exact boundary with %s", (mode) => {
    vi.useFakeTimers();
    vi.setSystemTime(local(15, 15));
    const windows = [14, 15, 16].map((hour) => ({ start: local(15, hour), end: local(15, hour + 1) }));
    for (const buckets of [
      statisticsRowsToBuckets(windows, [{ start: local(15, 14).toISOString(), mean: 7 }], "mean", mode),
      historyRowsToBuckets(windows, [{ state: "7", last_changed: local(15, 14).toISOString() }], "mean", mode),
    ]) {
      expect(buckets.map((bucket) => bucket.value)).toEqual([7, null, null]);
    }
  });
});

it.each(["empty", ...modes] as const)("accepts an explicit cutoff without mutating inputs under %s", (mode) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2040, 0, 1));
  const windows = [14, 15, 16].map((hour) => ({ start: local(15, hour), end: local(15, hour + 1) }));
  const cutoff = local(15, 15).getTime();
  const input = emptyBuckets(windows, "statistics");
  const expected = mode === "zero" ? [0, null, null] : [null, null, null];
  expect(applyMissingMode(input, mode, cutoff).map((bucket) => bucket.value)).toEqual(expected);
  expect(input.every((bucket) => bucket.value === null && bucket.quality === "missing")).toBe(true);
  // The unsupported-statistic path must use the same cutoff, too.
  expect(statisticsRowsToBuckets(windows, [], "delta", mode, cutoff).map((bucket) => bucket.value)).toEqual(expected);
  const expectedWithObservation = [7, null, null];
  expect(statisticsRowsToBuckets(windows, [{ start: local(15, 14).toISOString(), mean: 7 }], "mean", mode, cutoff).map((bucket) => bucket.value)).toEqual(expectedWithObservation);
  expect(historyRowsToBuckets(windows, [{ state: "7", last_changed: local(15, 14).toISOString() }], "mean", mode, cutoff).map((bucket) => bucket.value)).toEqual(expectedWithObservation);
});

it("keeps rolling query bounds stable across delayed auto fallback", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(local(15, 15, 30));
  const { hass, callApi, callWS } = fixture("auto-empty", [local(15, 14)], true);
  const config = configFor("auto-empty", "zero");
  config.range = { hours: 2, align: "rolling" };
  const expectedRange = calculateRange(config.range);
  const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);
  expect(result.buckets).toHaveLength(3);
  expect(result.buckets.map((bucket) => bucket.value)).toEqual([0, 7, 0]);
  expect(callWS).toHaveBeenCalledWith(expect.objectContaining({ end_time: expectedRange.end.toISOString() }));
  const request = callApi.mock.calls[0]![1];
  expect(request.split("?")[0]).toBe(`history/period/${expectedRange.start.toISOString()}`);
  expect(new URLSearchParams(request.split("?")[1]).get("end_time")).toBe(expectedRange.end.toISOString());
});
