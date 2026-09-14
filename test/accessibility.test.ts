import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const cardSource = readFileSync(new URL("../src/card.ts", import.meta.url), "utf8");
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

describe("card accessibility affordances", () => {
  it("exposes the canvas as a keyboard-focusable heatmap image", () => {
    expect(cardSource).toContain('role="img"');
    expect(cardSource).toContain('tabindex="0"');
    expect(cardSource).toContain("aria-label=${this._heatmapDescription(title)}");
    expect(cardSource).toContain("@keydown=${this._handleCanvasKeyDown}");
  });

  it("exposes status and entity navigation state to assistive tech", () => {
    expect(cardSource).toContain('role="status"');
    expect(cardSource).toContain('role="alert"');
    expect(cardSource).toContain("aria-pressed=");
  });

  it("uses the 4-hour strip model for visible labels, tooltips, and aria wording", () => {
    expect(cardSource).toContain('from "./time-labels"');
    expect(cardSource).toContain("return formatBucketDate(");
    expect(cardSource).toContain("return fiveMinuteElapsedTicks()");
    expect(cardSource).toContain("rowLabelWidthForInterval(interval)");
    expect(cardSource).toContain("axisLabelsForInterval(this._normalized?.bucket.interval).x");
    expect(cardSource).toContain("axisLabelsForInterval(this._normalized?.bucket.interval).y");
    expect(cardSource).toContain("return formatRowStart(");
  });

  it("documents local date-only ranges and native 5-minute strips", () => {
    expect(readme).toContain("Exact `YYYY-MM-DD` start/end values are interpreted as local midnight");
    expect(readme).toContain("native 5-minute buckets in 48-column, 4-hour rows");
    expect(readme).toContain("tooltips include local hours and minutes");
  });
});
