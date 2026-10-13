import { describe, expect, it, vi } from "vitest";
import { placeBucketsOnGrid } from "../src/layout";
import {
  axisLabelsForInterval,
  fiveMinuteElapsedTicks,
  formatBucketDate,
  formatRowStart,
  monthTickLabels,
  weekdayTickLabels,
} from "../src/time-labels";

describe("time labels", () => {
  it("includes local hour and minute in 5-minute bucket tooltips", () => {
    const date = new Date(2026, 4, 1, 0, 5, 0, 0);

    expect(formatBucketDate(date, "5minute", "en-US")).toBe("May 1, 12:05 AM");
  });

  it("labels each 5-minute row with its local date and 4-hour strip start", () => {
    const date = new Date(2026, 4, 1, 4, 0, 0, 0);

    expect(formatRowStart(date, "5minute", "en-US")).toBe("May 1, 4:00 AM");
  });

  it("describes 5-minute axes as elapsed time within dated 4-hour rows", () => {
    expect(axisLabelsForInterval("5minute")).toEqual({
      x: "elapsed time within each 4-hour row",
      y: "local date and row start time",
    });
  });

  it("uses relative elapsed offsets across every 48-column 4-hour strip", () => {
    expect(fiveMinuteElapsedTicks()).toEqual([
      { col: 0, label: "0h", align: "left" },
      { col: 12, label: "+1h", align: "center" },
      { col: 24, label: "+2h", align: "center" },
      { col: 36, label: "+3h", align: "center" },
      { col: 47, label: "+3h55m", align: "right" },
    ]);
  });

  it("labels daily columns with locale weekday names, Monday first", () => {
    const ticks = weekdayTickLabels("en-US");

    expect(ticks.map((tick) => tick.label)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(ticks.map((tick) => tick.col)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(ticks.every((tick) => tick.align === "center")).toBe(true);
  });

  const locales = [
    "en-US",
    "de-DE",
    "fa-IR",
    "ar-SA",
    "ar-SA-u-ca-islamic-umalqura",
    "th-TH",
    "fa-IR-u-ca-gregory",
    "ar-SA-u-ca-gregory",
    "th-TH-u-ca-gregory",
    "en-US-u-ca-persian",
    "fa-IR-u-ca-islamic",
    "th-TH-u-ca-buddhist-nu-thai",
  ];

  it.each(locales)("keeps all twelve Gregorian bucket months localized for %s", (locale) => {
    const DateTimeFormat = Intl.DateTimeFormat;
    let formatter: Intl.DateTimeFormat | undefined;
    // Observe the real production formatter so all twelve columns are checked,
    // while preserving the existing five visible ticks.
    const spy = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(function (locales, options) {
      formatter = new DateTimeFormat(locales, options);
      return formatter;
    });

    try {
      const ticks = monthTickLabels(locale);
      spy.mockRestore();
      const expected = new DateTimeFormat(locale, { month: "short", calendar: "gregory" });
      const buckets = Array.from({ length: 12 }, (_, month) => ({ start: new Date(2026, month, 1) }));
      const placement = placeBucketsOnGrid(buckets, "month");

      expect(placement.cells.map((cell) => cell.col)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
      expect(formatter).toBeDefined();
      expect(buckets.map((bucket) => formatter!.format(bucket.start))).toEqual(
        buckets.map((bucket) => expected.format(bucket.start)),
      );
      expect(formatter!.resolvedOptions()).toMatchObject({
        calendar: "gregory",
        locale: expected.resolvedOptions().locale,
        numberingSystem: expected.resolvedOptions().numberingSystem,
        timeZone: expected.resolvedOptions().timeZone,
      });
      expect(ticks).toEqual([0, 3, 6, 9, 11].map((col, index) => ({
        col,
        label: expected.format(buckets[col]!.start),
        align: index === 0 ? "left" : index === 4 ? "right" : "center",
      })));
    } finally {
      spy.mockRestore();
    }
  });

  it.each(locales)("preserves Monday-first localized weekday labels for %s", (locale) => {
    const format = new Intl.DateTimeFormat(locale, { weekday: "short" });
    expect(weekdayTickLabels(locale)).toEqual(Array.from({ length: 7 }, (_, col) => ({
      col,
      label: format.format(new Date(2024, 0, 1 + col)),
      align: "center",
    })));
  });

  it("labels monthly tick columns with locale month names", () => {
    expect(monthTickLabels("en-US")).toEqual([
      { col: 0, label: "Jan", align: "left" },
      { col: 3, label: "Apr", align: "center" },
      { col: 6, label: "Jul", align: "center" },
      { col: 9, label: "Oct", align: "center" },
      { col: 11, label: "Dec", align: "right" },
    ]);
  });
});
