import { describe, expect, it } from "vitest";
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
