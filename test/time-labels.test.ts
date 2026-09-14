import { describe, expect, it } from "vitest";
import {
  axisLabelsForInterval,
  fiveMinuteElapsedTicks,
  formatBucketDate,
  formatRowStart,
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
});
