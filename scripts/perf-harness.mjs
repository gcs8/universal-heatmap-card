#!/usr/bin/env node

import { performance } from "node:perf_hooks";

const stress = process.argv.includes("--stress");
const maxCells = 5000;

const cases = [
  { name: "14d hourly", cells: 14 * 24, cols: 24, iterations: 300, budgetP95Ms: 2.5 },
  { name: "90d hourly", cells: 90 * 24, cols: 24, iterations: 140, budgetP95Ms: 8 },
  { name: "default max cells", cells: maxCells, cols: 48, iterations: 80, budgetP95Ms: 18 },
];

if (stress) {
  cases.push(
    { name: "30d five-minute", cells: 30 * 24 * 12, cols: 48, iterations: 40, budgetP95Ms: 35 },
    { name: "60d five-minute", cells: 60 * 24 * 12, cols: 48, iterations: 20, budgetP95Ms: 70 },
  );
}

const palette = [
  [0, [47, 111, 159]],
  [0.5, [90, 164, 105]],
  [0.75, [242, 193, 78]],
  [1, [196, 69, 54]],
];

const rows = cases.map(runCase);
console.table(
  rows.map((row) => ({
    case: row.name,
    cells: row.cells,
    median_ms: row.medianMs,
    p95_ms: row.p95Ms,
    budget_ms: row.budgetP95Ms,
    checksum: row.checksum,
  })),
);

const failures = rows.filter((row) => row.p95Ms > row.budgetP95Ms);
if (failures.length > 0) {
  for (const failure of failures) {
    console.error(
      `Perf budget exceeded: ${failure.name} p95 ${failure.p95Ms} ms > ${failure.budgetP95Ms} ms`,
    );
  }
  process.exitCode = 1;
} else {
  console.log("Perf harness passed. This is a synthetic render-path proxy, not a browser FPS test.");
}

if (!stress) {
  console.log("Run npm run perf:stress for larger grids that exceed the default card guardrail.");
}

function runCase(testCase) {
  const values = generateValues(testCase.cells);
  const times = [];
  let checksum = 0;

  for (let iteration = 0; iteration < testCase.iterations; iteration += 1) {
    const start = performance.now();
    checksum += renderProxy(values, testCase.cols, iteration);
    times.push(performance.now() - start);
  }

  times.sort((a, b) => a - b);
  return {
    ...testCase,
    medianMs: round(times[Math.floor(times.length / 2)] ?? 0),
    p95Ms: round(times[Math.floor(times.length * 0.95)] ?? 0),
    checksum: Math.round(checksum) % 100000,
  };
}

function generateValues(count) {
  const values = new Array(count);
  for (let index = 0; index < count; index += 1) {
    const dayWave = Math.sin((index / 24) * Math.PI * 2) * 35;
    const weekWave = Math.sin((index / (24 * 7)) * Math.PI * 2) * 80;
    const spike = index % 397 === 0 ? 250 : 0;
    values[index] = 1200 + dayWave + weekWave + spike + (index % 17) * 4;
  }
  return values;
}

function renderProxy(values, cols, iteration) {
  const finite = values.filter(Number.isFinite);
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const sensitivity = iteration % 3 === 0 ? 1.35 : iteration % 3 === 1 ? 0.75 : 1;
  const scale = { min, max, sensitivity };
  const layout = calculateLayout(values.length, cols, 820);
  let checksum = layout.rows + layout.cell;

  for (let index = 0; index < values.length; index += 1) {
    const color = colorForValue(values[index], scale);
    checksum += color.charCodeAt(1) + (index % layout.cols);
  }

  return checksum;
}

function calculateLayout(count, cols, width) {
  const gap = 3;
  const labelWidth = 58;
  const labelHeight = 18;
  const gridWidth = Math.max(160, width - labelWidth);
  const cell = Math.max(7, Math.min(22, Math.floor((gridWidth - gap * (cols - 1)) / cols)));
  const rows = Math.ceil(Math.max(1, count) / cols);
  return { cols, rows, cell, height: labelHeight + rows * cell + Math.max(0, rows - 1) * gap };
}

function colorForValue(value, scale) {
  if (!Number.isFinite(value)) {
    return "#e5e7eb";
  }
  const span = Math.max(1e-9, scale.max - scale.min);
  const normalized = Math.max(0, Math.min(1, (value - scale.min) / span));
  const curved = applySensitivity(normalized, scale.sensitivity);
  const leftIndex = Math.max(
    0,
    palette.findIndex(([stop]) => curved <= stop) - 1,
  );
  const left = palette[leftIndex] ?? palette[0];
  const right = palette[Math.min(leftIndex + 1, palette.length - 1)] ?? left;
  const localSpan = Math.max(1e-9, right[0] - left[0]);
  const local = Math.max(0, Math.min(1, (curved - left[0]) / localSpan));
  const rgb = left[1].map((channel, index) => {
    const next = right[1][index] ?? channel;
    return Math.round(channel + (next - channel) * local);
  });
  return `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function applySensitivity(value, sensitivity) {
  if (sensitivity === 1) {
    return value;
  }
  const centered = value * 2 - 1;
  const adjusted = Math.sign(centered) * Math.abs(centered) ** (1 / sensitivity);
  return Math.max(0, Math.min(1, (adjusted + 1) / 2));
}

function round(value) {
  return Math.round(value * 100) / 100;
}
