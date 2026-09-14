import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  generateBucketWindows,
  historyRowsToBuckets,
  statisticsRowsToBuckets,
} from "../src/data/buckets";

describe("bucket generation", () => {
  it("generates day buckets across a range", () => {
    const windows = generateBucketWindows(
      {
        start: new Date("2026-05-01T12:00:00Z"),
        end: new Date("2026-05-04T00:00:00Z"),
      },
      "day",
    );

    expect(windows).toHaveLength(3);
    expect(windows[0]?.start.getTime()).toBeLessThanOrEqual(
      new Date("2026-05-01T12:00:00Z").getTime(),
    );
    expect(windows[0]?.end.getTime()).toBeGreaterThan(
      new Date("2026-05-01T12:00:00Z").getTime(),
    );
  });
});

describe("statisticsRowsToBuckets", () => {
  it("maps statistic rows into bucket values", () => {
    const windows = generateBucketWindows(
      {
        start: new Date("2026-05-01T00:00:00Z"),
        end: new Date("2026-05-03T00:00:00Z"),
      },
      "day",
    );
    const buckets = statisticsRowsToBuckets(
      windows,
      [
        { start: windows[0]?.start.toISOString(), mean: 10 },
        { start: windows[1]?.start.toISOString(), mean: 12 },
      ],
      "mean",
      "empty",
    );

    expect(buckets.slice(0, 2).map((bucket) => bucket.value)).toEqual([10, 12]);
  });
});

describe("historyRowsToBuckets", () => {
  it("aggregates raw numeric history", () => {
    const windows = generateBucketWindows(
      {
        start: new Date("2026-05-01T00:00:00Z"),
        end: new Date("2026-05-01T02:00:00Z"),
      },
      "hour",
    );
    const buckets = historyRowsToBuckets(
      windows,
      [
        { state: "1", last_changed: "2026-05-01T00:05:00Z" },
        { state: "3", last_changed: "2026-05-01T00:55:00Z" },
        { state: "6", last_changed: "2026-05-01T01:30:00Z" },
      ],
      "mean",
      "empty",
    );

    expect(buckets.map((bucket) => bucket.value)).toEqual([2, 6]);
  });
});

describe("DST hour buckets (America/New_York)", () => {
  const originalTz = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = "America/New_York";
  });

  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it("keeps 23 elapsed hours across the spring-forward day", () => {
    const windows = generateBucketWindows(
      { start: new Date("2026-03-08T05:00:00Z"), end: new Date("2026-03-09T04:00:00Z") },
      "hour",
    );

    expect(windows).toHaveLength(23);
    for (const window of windows) {
      expect(window.end.getTime() - window.start.getTime()).toBe(3_600_000);
    }
    expect(windows.map((window) => window.start.getHours())).toEqual([
      0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    ]);
  });

  it("keeps 25 elapsed hours across the fall-back day", () => {
    const windows = generateBucketWindows(
      { start: new Date("2026-11-01T04:00:00Z"), end: new Date("2026-11-02T05:00:00Z") },
      "hour",
    );

    expect(windows).toHaveLength(25);
    for (const window of windows) {
      expect(window.end.getTime() - window.start.getTime()).toBe(3_600_000);
    }
    const repeatedOneAm = windows.filter((window) => window.start.getHours() === 1);
    expect(repeatedOneAm).toHaveLength(2);
    expect(repeatedOneAm[0]?.start.getTimezoneOffset()).toBe(240);
    expect(repeatedOneAm[1]?.start.getTimezoneOffset()).toBe(300);
  });

  it("does not drop a statistics row when the fall-back hour repeats", () => {
    const windows = generateBucketWindows(
      { start: new Date("2026-11-01T04:00:00Z"), end: new Date("2026-11-02T05:00:00Z") },
      "hour",
    );
    const rows = windows.map((window, index) => ({
      start: window.start.toISOString(),
      mean: index,
    }));

    const buckets = statisticsRowsToBuckets(windows, rows, "mean", "empty");

    expect(buckets).toHaveLength(25);
    expect(buckets.map((bucket) => bucket.value)).toEqual(rows.map((row) => row.mean));
  });

  it("keeps local midnight aligned to a new day after spring forward", () => {
    const windows = generateBucketWindows(
      { start: new Date("2026-03-07T05:00:00Z"), end: new Date("2026-03-10T04:00:00Z") },
      "hour",
    );

    expect(windows).toHaveLength(71);
    expect(windows[47]?.start.getHours()).toBe(0);
    expect(windows[47]?.start.getDate()).toBe(9);
  });
});
