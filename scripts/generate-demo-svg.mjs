import { writeFile } from "node:fs/promises";

const days = ["May 10", "May 11", "May 12", "May 13", "May 14", "May 15", "May 16"];
const hours = Array.from({ length: 24 }, (_, hour) => hour);
const colorStops = ["#2f7ebc", "#55ad8a", "#f0cf62", "#f29a42", "#e33f32"];

function makeSeries(name, entity, base, dayShift, phase, shoulder = 0) {
  const values = days.map((_, dayIndex) => {
    return hours.map((hour) => {
      const daily = Math.sin(((hour - phase) / 24) * Math.PI * 2) * 2.8;
      const secondWave = Math.sin(((hour + dayIndex * 1.7) / 12) * Math.PI * 2) * 0.9;
      const dayWave = Math.sin((dayIndex / 6) * Math.PI * 2) * dayShift;
      const lunchBump = Math.exp(-Math.pow(hour - 13, 2) / 18) * shoulder;
      const eveningBump = Math.exp(-Math.pow(hour - 20, 2) / 12) * shoulder * 0.8;
      const notch = (dayIndex === 3 && hour >= 2 && hour <= 4) ? -4.8 : 0;
      return round(base + daily + secondWave + dayWave + lunchBump + eveningBump + notch);
    });
  });
  return { name, entity, unit: "\\u00b0F", values };
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function flatten(series) {
  return series.values.flat().filter((value) => Number.isFinite(value));
}

function stats(series) {
  const values = flatten(series);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    latest: values[values.length - 1],
  };
}

function interpolateColor(a, b, t) {
  const left = parseInt(a.slice(1), 16);
  const right = parseInt(b.slice(1), 16);
  const ar = (left >> 16) & 255;
  const ag = (left >> 8) & 255;
  const ab = left & 255;
  const br = (right >> 16) & 255;
  const bg = (right >> 8) & 255;
  const bb = right & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const blue = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, blue].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

function colorFor(value, min, max) {
  if (!Number.isFinite(value)) return "#e5e7eb";
  if (max <= min) return colorStops[Math.floor(colorStops.length / 2)];
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const scaled = normalized * (colorStops.length - 1);
  const index = Math.min(colorStops.length - 2, Math.floor(scaled));
  return interpolateColor(colorStops[index], colorStops[index + 1], scaled - index);
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatValue(value) {
  return `${value.toFixed(1)} &#176;F`;
}

function timeLabel(hour) {
  if (hour === 0) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
}

const series = [
  makeSeries("Kitchen", "sensor.example_kitchen_temperature", 71.8, 0.8, 7, 2.1),
  makeSeries("Living Room", "sensor.example_living_room_temperature", 70.4, 0.5, 8, 1.4),
  makeSeries("Office", "sensor.example_office_temperature", 73.0, 1.1, 6, 2.8),
];

const initial = series[0];
const initialStats = stats(initial);
const cellWidth = 32;
const cellHeight = 24;
const gap = 4;
const gridX = 190;
const gridY = 250;
const labelX = 162;
const tickY = 234;

const cells = initial.values
  .flatMap((row, rowIndex) =>
    row.map((value, colIndex) => {
      const index = rowIndex * 24 + colIndex;
      const x = gridX + colIndex * (cellWidth + gap);
      const y = gridY + rowIndex * (cellHeight + gap);
      const title = `${initial.name} - ${days[rowIndex]} ${String(colIndex).padStart(2, "0")}:00 - ${value.toFixed(1)} F`;
      return `      <rect class="cell" data-index="${index}" tabindex="0" role="button" x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" rx="3" fill="${colorFor(value, initialStats.min, initialStats.max)}"><title>${xmlEscape(title)}</title></rect>`;
    }),
  )
  .flat()
  .join("\n");

const rowLabels = days
  .map((day, rowIndex) => {
    const y = gridY + rowIndex * (cellHeight + gap) + 16;
    return `      <text class="axis-label" x="${labelX}" y="${y}">${day}</text>`;
  })
  .join("\n");

const timeTicks = [0, 6, 12, 18, 23]
  .map((hour) => {
    const x = gridX + hour * (cellWidth + gap) + cellWidth / 2;
    return `      <text class="axis-label tick" x="${x}" y="${tickY}">${timeLabel(hour)}</text>`;
  })
  .join("\n");

const tabs = series
  .map((item, index) => {
    const tabGap = 14;
    const widths = [120, 140, 120];
    const x = 124 + widths.slice(0, index).reduce((total, width) => total + width + tabGap, 0);
    const width = widths[index] ?? 120;
    return `    <g class="tab${index === 0 ? " active" : ""}" data-series="${index}" tabindex="0" role="button" aria-label="Show ${xmlEscape(item.name)}">
      <rect x="${x}" y="170" width="${width}" height="46" rx="8"></rect>
      <text x="${x + width / 2}" y="200">${xmlEscape(item.name)}</text>
    </g>`;
  })
  .join("\n");

const runtimeScript = `
<![CDATA[
(function () {
  "use strict";
  var days = ${JSON.stringify(days)};
  var hours = ${JSON.stringify(hours)};
  var colors = ${JSON.stringify(colorStops)};
  var series = ${JSON.stringify(series)};
  var selected = 0;
  var pinnedIndex = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function flatten(values) {
    var output = [];
    values.forEach(function (row) {
      row.forEach(function (value) {
        if (Number.isFinite(value)) output.push(value);
      });
    });
    return output;
  }

  function getStats(item) {
    var values = flatten(item.values);
    return {
      min: Math.min.apply(null, values),
      max: Math.max.apply(null, values),
      latest: values[values.length - 1],
    };
  }

  function hexToRgb(hex) {
    var value = parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  function rgbToHex(parts) {
    return "#" + parts.map(function (part) {
      return Math.round(part).toString(16).padStart(2, "0");
    }).join("");
  }

  function mixColor(left, right, amount) {
    var a = hexToRgb(left);
    var b = hexToRgb(right);
    return rgbToHex([
      a[0] + (b[0] - a[0]) * amount,
      a[1] + (b[1] - a[1]) * amount,
      a[2] + (b[2] - a[2]) * amount,
    ]);
  }

  function colorFor(value, min, max) {
    if (!Number.isFinite(value)) return "#e5e7eb";
    if (max <= min) return colors[Math.floor(colors.length / 2)];
    var normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
    var scaled = normalized * (colors.length - 1);
    var index = Math.min(colors.length - 2, Math.floor(scaled));
    return mixColor(colors[index], colors[index + 1], scaled - index);
  }

  function valueAt(index) {
    var row = Math.floor(index / 24);
    var col = index % 24;
    return series[selected].values[row][col];
  }

  function formatValue(value) {
    return value.toFixed(1) + " \\u00b0F";
  }

  function describe(index) {
    var row = Math.floor(index / 24);
    var col = index % 24;
    return series[selected].name + " - " + days[row] + " " + String(hours[col]).padStart(2, "0") + ":00 - " + formatValue(valueAt(index));
  }

  function setText(id, text) {
    byId(id).textContent = text;
  }

  function updateDetails(index, pinned) {
    if (index == null) {
      setText("details", "Hover a cell for exact bucket details. Click a cell to pin it.");
      return;
    }
    setText("details", (pinned ? "Pinned: " : "Bucket: ") + describe(index));
  }

  function clearActiveCell() {
    Array.prototype.forEach.call(document.querySelectorAll(".cell.active"), function (cell) {
      cell.classList.remove("active");
    });
  }

  function setActiveCell(index) {
    clearActiveCell();
    if (index == null) return;
    var cell = document.querySelector('.cell[data-index="' + index + '"]');
    if (cell) cell.classList.add("active");
  }

  function switchSeries(index) {
    selected = index;
    pinnedIndex = null;
    var item = series[selected];
    var itemStats = getStats(item);
    setText("entity", item.entity);
    setText("chip", formatValue(itemStats.latest));
    setText("low", "Low " + formatValue(itemStats.min));
    setText("high", "High " + formatValue(itemStats.max));
    setText("latest", "Latest " + formatValue(itemStats.latest));
    setText("legend-min", formatValue(Math.floor(itemStats.min)));
    setText("legend-max", formatValue(Math.ceil(itemStats.max)));
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (tab) {
      tab.classList.toggle("active", Number(tab.getAttribute("data-series")) === index);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".cell"), function (cell) {
      var cellIndex = Number(cell.getAttribute("data-index"));
      var value = valueAt(cellIndex);
      cell.setAttribute("fill", colorFor(value, itemStats.min, itemStats.max));
      cell.querySelector("title").textContent = describe(cellIndex);
    });
    setActiveCell(null);
    updateDetails(null, false);
  }

  function findTarget(node, attr) {
    while (node && node !== document) {
      if (node.getAttribute && node.hasAttribute(attr)) return node;
      node = node.parentNode;
    }
    return null;
  }

  function activate(node) {
    var tab = findTarget(node, "data-series");
    if (tab) {
      switchSeries(Number(tab.getAttribute("data-series")));
      return;
    }
    var cell = findTarget(node, "data-index");
    if (cell) {
      pinnedIndex = Number(cell.getAttribute("data-index"));
      setActiveCell(pinnedIndex);
      updateDetails(pinnedIndex, true);
    }
  }

  function init() {
    switchSeries(0);
    window.addEventListener("click", function (event) {
      activate(event.target);
    }, false);
    window.addEventListener("mouseover", function (event) {
      var cell = findTarget(event.target, "data-index");
      if (cell && pinnedIndex == null) updateDetails(Number(cell.getAttribute("data-index")), false);
    }, false);
    window.addEventListener("mouseout", function (event) {
      var cell = findTarget(event.target, "data-index");
      if (cell && pinnedIndex == null) updateDetails(null, false);
    }, false);
    window.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        var target = findTarget(event.target, "data-index") || findTarget(event.target, "data-series");
        if (target) {
          event.preventDefault();
          activate(target);
        }
      }
      if (event.key === "Escape") {
        pinnedIndex = null;
        setActiveCell(null);
        updateDetails(null, false);
      }
    }, false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, false);
  } else {
    init();
  }
}());
]]>
`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" width="1200" height="610" viewBox="0 0 1200 610" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Universal Heatmap Card interactive demo</title>
  <desc id="desc">Synthetic Home Assistant heatmap demo. Open this SVG directly to switch rooms and inspect cell values.</desc>
  <defs>
    <filter id="soft-shadow" x="-12%" y="-12%" width="124%" height="124%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#334155" flood-opacity="0.14"/>
    </filter>
    <linearGradient id="legend-gradient" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="${colorStops[0]}"/>
      <stop offset="28%" stop-color="${colorStops[1]}"/>
      <stop offset="56%" stop-color="${colorStops[2]}"/>
      <stop offset="78%" stop-color="${colorStops[3]}"/>
      <stop offset="100%" stop-color="${colorStops[4]}"/>
    </linearGradient>
  </defs>
  <style type="text/css"><![CDATA[
    :root { color-scheme: light; }
    .page { fill: #f3f6fb; }
    .card { fill: #ffffff; stroke: #dce5ef; stroke-width: 2; filter: url(#soft-shadow); }
    text { font-family: "Segoe UI", Arial, sans-serif; fill: #0f2138; }
    .title { font-size: 38px; font-weight: 750; letter-spacing: 0; }
    .subtitle, .axis-label, .meta, .details, .legend-label { fill: #708298; }
    .subtitle { font-size: 20px; }
    .axis-label { font-size: 15px; text-anchor: end; }
    .tick { text-anchor: middle; }
    .details { font-size: 16px; }
    .summary { font-size: 21px; font-weight: 700; text-anchor: middle; fill: #1d3b5d; }
    .chip { fill: #f0f5fb; stroke: #dbe5f0; stroke-width: 2; }
    .tab rect { fill: #eef4fa; stroke: #d6e0ea; stroke-width: 2; cursor: pointer; }
    .tab text { font-size: 20px; fill: #36506d; text-anchor: middle; pointer-events: none; }
    .tab:hover rect, .tab:focus rect { stroke: #2f7ebc; }
    .tab.active rect { fill: #2f74b5; stroke: #2f74b5; }
    .tab.active text { fill: #ffffff; font-weight: 700; }
    .cell { cursor: pointer; shape-rendering: crispEdges; stroke: #ffffff; stroke-width: 1; }
    .cell:hover, .cell:focus, .cell.active { stroke: #0f2138; stroke-width: 2.4; }
    .legend-track { fill: url(#legend-gradient); }
    .legend-label { font-size: 15px; }
    .low { text-anchor: start; }
    .high { text-anchor: middle; }
    .latest { text-anchor: end; }
    .link { fill: #2f74b5; font-size: 16px; font-weight: 650; text-decoration: underline; }
  ]]></style>
  <script type="text/ecmascript">${runtimeScript}</script>
  <rect class="page" x="0" y="0" width="1200" height="610"/>
  <rect class="card" x="86" y="58" width="1028" height="535" rx="14"/>
  <text class="title" x="124" y="118">Universal Heatmap Card</text>
  <text id="entity" class="subtitle" x="124" y="158">${initial.entity}</text>
  <rect class="chip" x="918" y="88" width="148" height="46" rx="24"/>
  <text id="chip" class="summary" x="992" y="118">${formatValue(initialStats.latest)}</text>
${tabs}
  <g id="axis">
${timeTicks}
${rowLabels}
  </g>
  <g id="cells" aria-label="Interactive heatmap cells">
${cells}
  </g>
  <text id="details" class="details" x="124" y="490">Hover a cell for exact bucket details. Click a cell to pin it.</text>
  <text id="low" class="legend-label low" x="124" y="522">Low ${formatValue(initialStats.min)}</text>
  <text id="high" class="legend-label high" x="600" y="522">High ${formatValue(initialStats.max)}</text>
  <text id="latest" class="legend-label latest" x="1066" y="522">Latest ${formatValue(initialStats.latest)}</text>
  <rect class="legend-track" x="124" y="536" width="942" height="15" rx="8"/>
  <text id="legend-min" class="legend-label low" x="124" y="576">${formatValue(Math.floor(initialStats.min))}</text>
  <text id="legend-max" class="legend-label latest" x="1066" y="576">${formatValue(Math.ceil(initialStats.max))}</text>
</svg>
`;

if (process.argv.includes("--write")) {
  const outputUrl = new URL("../docs/images/demo-heatmap.svg", import.meta.url);
  await writeFile(outputUrl, svg, "utf8");
  console.log(`Wrote ${outputUrl.pathname}`);
} else {
  process.stdout.write(svg);
}
