import { describe, expect, it } from "vitest";
import { buildScale, colorForValue, formatValue, legendGradient } from "../src/scale";
import type { BucketValue } from "../src/types";

const buckets: BucketValue[] = [
  {
    start: new Date("2026-05-01T00:00:00Z"),
    end: new Date("2026-05-02T00:00:00Z"),
    value: 0,
    quality: "ok",
    source: "statistics",
  },
  {
    start: new Date("2026-05-02T00:00:00Z"),
    end: new Date("2026-05-03T00:00:00Z"),
    value: 100,
    quality: "ok",
    source: "statistics",
  },
];

const signedBuckets: BucketValue[] = [-8, -3, 0, 2, 5].map((value, index) => ({
  start: new Date(`2026-05-01T0${index}:00:00Z`),
  end: new Date(`2026-05-01T0${index + 1}:00:00Z`),
  value,
  quality: "ok" as const,
  source: "statistics" as const,
}));

describe("scale", () => {
  it("builds a fixed scale", () => {
    const scale = buildScale(buckets, { min: 0, max: 100, unit: "%" });

    expect(scale.min).toBe(0);
    expect(scale.max).toBe(100);
    expect(formatValue(42.123, scale, "en-US")).toBe("42.1 %");
  });

  it("interpolates colors", () => {
    const scale = buildScale(buckets, {
      min: 0,
      max: 100,
      stops: [
        { value: 0, color: "#000000" },
        { value: 100, color: "#ffffff" },
      ],
    });

    expect(colorForValue(50, scale)).toBe("rgb(128, 128, 128)");
  });

  it("treats 0..1 stops as relative to the active scale", () => {
    const scale = buildScale(buckets, {
      min: 0,
      max: 1000,
      stops: [
        { value: 0, color: "#000000" },
        { value: 0.5, color: "#ffffff" },
        { value: 1, color: "#ff0000" },
      ],
    });

    expect(scale.stops.map((stop) => stop.value)).toEqual([0, 500, 1000]);
    expect(colorForValue(500, scale)).toBe("rgb(255, 255, 255)");
  });

  it("auto-scales to the observed non-zero bucket range", () => {
    const scale = buildScale(
      [
        {
          start: new Date("2026-05-01T00:00:00Z"),
          end: new Date("2026-05-01T01:00:00Z"),
          value: 0,
          quality: "ok",
          source: "statistics",
        },
        {
          start: new Date("2026-05-01T01:00:00Z"),
          end: new Date("2026-05-01T02:00:00Z"),
          value: 3756,
          quality: "ok",
          source: "statistics",
        },
        {
          start: new Date("2026-05-01T02:00:00Z"),
          end: new Date("2026-05-01T03:00:00Z"),
          value: 4137,
          quality: "ok",
          source: "statistics",
        },
      ],
      {
        ignore_zero: "auto",
        stops: [
          { value: 0, color: "#000000" },
          { value: 1, color: "#ffffff" },
        ],
      },
    );

    expect(scale.min).toBe(3756);
    expect(scale.max).toBe(4137);
  });

  it("can trim outlier-driven scale endpoints", () => {
    const scale = buildScale(
      [10, 11, 12, 13, 14, 1000].map((value, index) => ({
        start: new Date(`2026-05-01T0${index}:00:00Z`),
        end: new Date(`2026-05-01T0${index + 1}:00:00Z`),
        value,
        quality: "ok" as const,
        source: "statistics" as const,
      })),
      {
        outlier_clip: 20,
      },
    );

    expect(scale.min).toBe(11);
    expect(scale.max).toBe(14);
    expect(scale.clippedLow).toBe(true);
    expect(scale.clippedHigh).toBe(true);
  });

  it("applies sensitivity as a color contrast curve", () => {
    const normal = buildScale(buckets, {
      min: 0,
      max: 100,
      stops: [
        { value: 0, color: "#000000" },
        { value: 100, color: "#ffffff" },
      ],
    });
    const softened = buildScale(buckets, {
      min: 0,
      max: 100,
      sensitivity: 0.5,
      stops: [
        { value: 0, color: "#000000" },
        { value: 100, color: "#ffffff" },
      ],
    });

    expect(colorForValue(75, normal)).toBe("rgb(191, 191, 191)");
    expect(colorForValue(75, softened)).toBe("rgb(159, 159, 159)");
    expect(legendGradient(softened)).toContain("rgb(");
  });

  it("keeps negative values when zero is ignored explicitly", () => {
    const scale = buildScale(signedBuckets, {
      ignore_zero: true,
      stops: [
        { value: 0, color: "#000000" },
        { value: 1, color: "#ffffff" },
      ],
    });

    expect(scale.min).toBe(-8);
    expect(scale.max).toBe(5);
    expect(colorForValue(-8, scale)).not.toBe(colorForValue(2, scale));
  });

  it("does not auto-ignore zero for signed series", () => {
    for (const config of [{}, { ignore_zero: "auto" as const }]) {
      const scale = buildScale(signedBuckets, config);

      expect(scale.min).toBe(-8);
      expect(scale.max).toBe(5);
      expect(scale.clippedLow).toBe(false);
    }
  });
});
