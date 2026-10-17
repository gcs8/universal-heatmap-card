import { describe, expect, it } from "vitest";
import { fitCanvasColumns, rowLabelWidthForInterval } from "../src/layout";

describe("narrow grid color visibility", () => {
  it.each([
    { interval: "hour" as const, cols: 24, width: 136 },
    { interval: "hour" as const, cols: 24, width: 160 },
    { interval: "hour" as const, cols: 24, width: 208 },
    { interval: "5minute" as const, cols: 48, width: 208 },
    { interval: "5minute" as const, cols: 48, width: 448 },
  ])("keeps gaps subordinate to $interval cells at $width px", ({ interval, cols, width }) => {
    const fit = fitCanvasColumns({ width, cols, interval, labelWidth: rowLabelWidthForInterval(interval), reserveValues: false });
    expect(fit.gap).toBeLessThanOrEqual(Math.floor(fit.cell / 2));
    expect(fit.labelWidth + cols * fit.cell + (cols - 1) * fit.gap).toBeLessThanOrEqual(fit.width);
    if (interval === "hour" && width === 160) expect(fit.cell).toBeGreaterThanOrEqual(2);
  });
});
