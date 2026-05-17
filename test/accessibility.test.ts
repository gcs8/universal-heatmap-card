import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const cardSource = readFileSync(new URL("../src/card.ts", import.meta.url), "utf8");

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
});
