export function cellValueFontSize(cell: number): number {
  if (cell < 9) {
    return 0;
  }
  if (cell < 14) {
    return Math.max(6, Math.min(8, Math.floor(cell * 0.72)));
  }
  return Math.max(9, Math.min(13, Math.floor(cell * 0.48)));
}

export function cellValueFractionDigits(span: number, cell: number): number {
  if (cell < 14) {
    return 0;
  }
  const digits = span < 1 ? 2 : span < 20 ? 1 : 0;
  if (cell < 18) {
    return Math.min(digits, 0);
  }
  return digits;
}
