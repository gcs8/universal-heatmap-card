import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { calculateRange, normalizeConfig } from "../src/config";
import { fetchHeatmapBuckets } from "../src/data/provider";
import type { HeatmapCardConfig, HomeAssistant } from "../src/types";

const originalTz = process.env.TZ;
beforeAll(() => { process.env.TZ = "America/New_York"; });
afterEach(() => vi.useRealTimers());
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

type Case = {
  name: string;
  now: string;
  range: HeatmapCardConfig["range"];
  elapsed: number;
  cap?: number;
};
const cases: Case[] = [
  ...[
    { name: "fall-back", now: "2026-11-01T15:00:00-05:00", elapsed: 25 },
    { name: "spring-forward", now: "2026-03-08T15:00:00-04:00", elapsed: 23 },
    { name: "ordinary", now: "2026-10-15T15:00:00-04:00", elapsed: 24 },
  ].flatMap((day) => [
    { ...day, name: `${day.name} default day-aligned 24 hours`, range: { hours: 24 } },
    { ...day, name: `${day.name} day-aligned one day`, range: { days: 1 } },
    { ...day, name: `${day.name} rolling 24 hours`, range: { hours: 24, align: "rolling" as const }, elapsed: 24 },
    { ...day, name: `${day.name} rolling one day`, range: { days: 1, align: "rolling" as const }, elapsed: 24 },
  ]),
  { name: "full fall-back day explicitly allowed by cap 25", now: "2026-11-01T15:00:00-05:00", range: { days: 1 }, elapsed: 25, cap: 25 },
  { name: "full fall-back hours explicitly allowed by cap 25", now: "2026-11-01T15:00:00-05:00", range: { hours: 24 }, elapsed: 25, cap: 25 },
  { name: "spring day exactly at cap 23", now: "2026-03-08T15:00:00-04:00", range: { days: 1 }, elapsed: 23, cap: 23 },
  { name: "spring day over cap 22", now: "2026-03-08T15:00:00-04:00", range: { days: 1 }, elapsed: 23, cap: 22 },
  { name: "two local fall-back days still capped at 25", now: "2026-11-01T15:00:00-05:00", range: { days: 2 }, elapsed: 49, cap: 25 },
  { name: "explicit fall-back local dates capped at 24", now: "2026-11-01T15:00:00-05:00", range: { start: "2026-11-01", end: "2026-11-02" }, elapsed: 25 },
  { name: "explicit spring local dates allowed at 24", now: "2026-03-08T15:00:00-04:00", range: { start: "2026-03-08", end: "2026-03-09" }, elapsed: 23 },
  { name: "explicit ordinary local dates exactly at 24", now: "2026-10-15T15:00:00-04:00", range: { start: "2026-10-15", end: "2026-10-16" }, elapsed: 24 },
  { name: "explicit offset fall-back window capped at 24", now: "2026-11-01T15:00:00-05:00", range: { start: "2026-11-01T00:00:00-04:00", end: "2026-11-02T00:00:00-05:00", align: "rolling" }, elapsed: 25 },
  { name: "explicit offset fall-back window allowed at 25", now: "2026-11-01T15:00:00-05:00", range: { start: "2026-11-01T00:00:00-04:00", end: "2026-11-02T00:00:00-05:00" }, elapsed: 25, cap: 25 },
  { name: "explicit custom window exactly at cap 6", now: "2026-11-01T15:00:00-05:00", range: { start: "2026-11-01T00:00:00Z", end: "2026-11-01T06:00:00Z" }, elapsed: 6, cap: 6 },
  { name: "explicit custom window one millisecond over cap 6", now: "2026-11-01T15:00:00-05:00", range: { start: "2026-11-01T00:00:00Z", end: "2026-11-01T06:00:00.001Z" }, elapsed: 6 + 1 / 3_600_000, cap: 6 },
];

describe.each(["history", "auto-empty", "auto-failure"] as const)("absolute raw-history cap via %s", (provider) => {
  it.each(cases)("$name", async ({ now, range, elapsed, cap }) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    const config = normalizeConfig({
      entity: "sensor.example",
      range,
      bucket: { interval: "hour", value: "mean" },
      data: { provider: provider === "history" ? "history" : "auto", ...(cap === undefined ? {} : { raw_history_hours: cap }) },
      missing: { mode: "zero" },
    });
    const actualRange = calculateRange(config.range);
    expect((actualRange.end.getTime() - actualRange.start.getTime()) / 3_600_000).toBe(elapsed);
    expect(config.data.raw_history_hours).toBe(cap ?? 24);
    const callApi = vi.fn(async (_method: string, _path: string) => [[{
      state: "7", last_changed: actualRange.start.toISOString(),
    }]]);
    const callWS = vi.fn(async () => {
      if (provider === "auto-failure") throw new Error("statistics unavailable");
      return {};
    });
    const hass: HomeAssistant = {
      states: {},
      callWS: async <T>() => await callWS() as T,
      callApi: async <T>(method: string, path: string) => await callApi(method, path) as T,
    };
    const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);
    expect(result.source).toBe("history");
    expect(callWS).toHaveBeenCalledTimes(provider === "history" ? 0 : 1);
    if (elapsed > config.data.raw_history_hours) {
      expect(callApi).not.toHaveBeenCalled();
      expect(result.warning).toContain(`Raw history fallback is capped at ${cap ?? 24} hours`);
      expect(result.buckets.length).toBeGreaterThan(0);
      expect(result.buckets.every((bucket) => bucket.value === null && bucket.quality === "missing")).toBe(true);
    } else {
      expect(callApi).toHaveBeenCalledTimes(1);
      expect(result.warning ?? "").not.toContain("capped");
      const [method, request] = callApi.mock.calls[0]!;
      expect(method).toBe("GET");
      expect(request.split("?")[0]).toBe(`history/period/${actualRange.start.toISOString()}`);
      expect(new URLSearchParams(request.split("?")[1]).get("end_time")).toBe(actualRange.end.toISOString());
      expect(result.buckets[0]).toMatchObject({ value: 7, quality: "ok" });
    }
  });
});

it.each(["statistics", "auto"] as const)("does not apply the raw-history cap to usable %s statistics", async (provider) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-01T15:00:00-05:00"));
  const config = normalizeConfig({
    entity: "sensor.example", range: { days: 1 },
    bucket: { interval: "hour", value: "mean" }, data: { provider },
  });
  const range = calculateRange(config.range);
  const callApi = vi.fn();
  const hass: HomeAssistant = {
    states: {},
    callWS: async <T>() => ({ "sensor.example": [{ start: range.start.toISOString(), mean: 7 }] }) as T,
    callApi,
  };
  const result = await fetchHeatmapBuckets(hass, config, config.entities[0]!);
  expect(result.source).toBe("statistics");
  expect(result.warning).toBeUndefined();
  expect(result.buckets).toHaveLength(25);
  expect(result.buckets[0]?.value).toBe(7);
  expect(callApi).not.toHaveBeenCalled();
});
