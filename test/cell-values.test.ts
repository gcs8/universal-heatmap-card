import { describe, expect, it } from "vitest";
import { cellValueFontSize, cellValueFractionDigits } from "../src/cell-values";

describe("cell value labels", () => {
  it("keeps compact labels available on narrower cards", () => {
    expect(cellValueFontSize(8)).toBe(0);
    expect(cellValueFontSize(10)).toBeGreaterThan(0);
    expect(cellValueFontSize(14)).toBeGreaterThan(cellValueFontSize(10));
  });

  it("uses whole-number labels when cells are too small for decimals", () => {
    expect(cellValueFractionDigits(8, 10)).toBe(0);
    expect(cellValueFractionDigits(8, 16)).toBe(0);
    expect(cellValueFractionDigits(8, 20)).toBe(1);
  });
});
