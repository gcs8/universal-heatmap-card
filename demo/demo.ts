import "../src/card";
import type {
  HassEntity,
  HeatmapCardConfig,
  HistoryStateRow,
  HomeAssistant,
  StatisticsRow,
} from "../src/types";

interface DemoFixture {
  generated_at: string;
  note: string;
  config: HeatmapCardConfig;
  views?: DemoFixtureView[];
  states: Record<string, HassEntity>;
  statistics: Record<string, StatisticsRow[]>;
  source?: {
    kind: string;
    days?: number;
    period?: string;
    sample?: {
      groups?: Array<{ id: string; label: string; entities: string[] }>;
    };
  };
}

interface DemoFixtureView {
  id: string;
  label: string;
  entity_count?: number;
  config: HeatmapCardConfig;
}

class DemoHaCard extends HTMLElement {
  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: "open" });
      const wrapper = document.createElement("div");
      wrapper.setAttribute("part", "card");
      wrapper.innerHTML = "<slot></slot>";
      const style = document.createElement("style");
      style.textContent = `
        div {
          background: var(--card-background-color);
          border-radius: 8px;
          box-shadow: var(--ha-card-box-shadow);
          display: block;
        }
      `;
      shadow.append(style, wrapper);
    }
  }
}

if (!customElements.get("ha-card")) {
  customElements.define("ha-card", DemoHaCard);
}

const note = document.querySelector("#demo-note");
const controls = document.querySelector("#demo-controls");
const viewControls = document.querySelector("#view-controls");
const scaleControls = document.querySelector("#scale-controls");
const app = document.querySelector("#app");
const card = document.createElement("universal-heatmap-card") as HTMLElement & {
  setConfig: (nextConfig: HeatmapCardConfig) => void;
  hass: HomeAssistant;
  requestUpdate: () => void;
};

app?.append(card);

type ScaleTuningId = "auto" | "enhance" | "soften" | "trim" | "trim_enhance";

const scaleTunings: Record<
  ScaleTuningId,
  { label: string; scale: Partial<NonNullable<HeatmapCardConfig["scale"]>> }
> = {
  auto: { label: "Auto scale", scale: {} },
  enhance: { label: "Enhance close values", scale: { sensitivity: 1.45 } },
  soften: { label: "Soften peaky values", scale: { sensitivity: 0.65 } },
  trim: { label: "Trim outliers", scale: { outlier_clip: 2 } },
  trim_enhance: {
    label: "Trim + enhance",
    scale: { outlier_clip: 2, sensitivity: 1.25 },
  },
};

let activeScaleTuning: ScaleTuningId = "auto";

const syntheticFixture = buildSyntheticFixture();
const localFixture = await loadLocalFixture();
renderControls(syntheticFixture, localFixture);
applyFixture(localFixture ?? syntheticFixture, localFixture ? "real" : "synthetic");

function renderControls(synthetic: DemoFixture, local: DemoFixture | null): void {
  if (!controls) {
    return;
  }

  controls.replaceChildren(
    button("Synthetic fixture", () => applyFixture(synthetic, "synthetic")),
    button("Local HA fixture", () => {
      if (local) {
        applyFixture(local, "real");
      }
    }, !local),
  );
}

function button(label: string, onClick: () => void, disabled = false): HTMLButtonElement {
  const element = document.createElement("button");
  element.type = "button";
  element.textContent = label;
  element.disabled = disabled;
  element.addEventListener("click", onClick);
  return element;
}

function applyFixture(fixture: DemoFixture, mode: "synthetic" | "real", viewId?: string): void {
  const view = selectView(fixture, viewId);
  const config = applyScaleTuning(view?.config ?? fixture.config);
  const hass = fixtureToHass(fixture, config);
  card.hass = hass;
  card.setConfig(config);
  card.requestUpdate();
  updateStatus(fixture, mode, view);
  updateActiveButton(mode);
  renderViewControls(fixture, mode, view);
  renderScaleControls(fixture, mode, view);
}

function updateActiveButton(mode: "synthetic" | "real"): void {
  const buttons = Array.from(controls?.querySelectorAll("button") ?? []);
  buttons.forEach((control) => control.classList.remove("active"));
  const index = mode === "synthetic" ? 0 : 1;
  buttons[index]?.classList.add("active");
}

function updateStatus(
  fixture: DemoFixture,
  mode: "synthetic" | "real",
  view?: DemoFixtureView,
): void {
  if (!note) {
    return;
  }

  if (mode === "real") {
    const generated = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(fixture.generated_at));
    const viewText = view
      ? ` ${view.label}, ${view.entity_count ?? entityCount(view.config)} entities.`
      : "";
    const groupCount = fixture.views?.length ? ` ${fixture.views.length} views.` : "";
    note.textContent = `Static local Home Assistant fixture, synced ${generated}.${viewText}${groupCount} This file is gitignored.`;
    return;
  }

  note.textContent = "Generated fixture data, not Home Assistant recorder history.";
}

function renderViewControls(
  fixture: DemoFixture,
  mode: "synthetic" | "real",
  activeView?: DemoFixtureView,
): void {
  if (!viewControls) {
    return;
  }

  const views = fixture.views ?? [];
  if (views.length <= 1) {
    viewControls.replaceChildren();
    return;
  }

  const label = document.createElement("label");
  label.htmlFor = "metric-view";
  label.textContent = "Metric view";

  const select = document.createElement("select");
  select.id = "metric-view";
  for (const view of views) {
    const option = document.createElement("option");
    option.value = view.id;
    option.textContent = `${view.label} (${view.entity_count ?? entityCount(view.config)})`;
    option.selected = view.id === activeView?.id;
    select.append(option);
  }
  select.addEventListener("change", () => applyFixture(fixture, mode, select.value));

  viewControls.replaceChildren(label, select);
}

function renderScaleControls(
  fixture: DemoFixture,
  mode: "synthetic" | "real",
  activeView?: DemoFixtureView,
): void {
  if (!scaleControls) {
    return;
  }

  const label = document.createElement("label");
  label.htmlFor = "scale-tuning";
  label.textContent = "Scale tuning";

  const select = document.createElement("select");
  select.id = "scale-tuning";
  for (const [id, tuning] of Object.entries(scaleTunings) as Array<
    [ScaleTuningId, (typeof scaleTunings)[ScaleTuningId]]
  >) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = tuning.label;
    option.selected = id === activeScaleTuning;
    select.append(option);
  }

  select.addEventListener("change", () => {
    activeScaleTuning = select.value as ScaleTuningId;
    applyFixture(fixture, mode, activeView?.id);
  });

  scaleControls.replaceChildren(label, select);
}

function applyScaleTuning(config: HeatmapCardConfig): HeatmapCardConfig {
  const tuning = scaleTunings[activeScaleTuning];
  if (!tuning || Object.keys(tuning.scale).length === 0) {
    return config;
  }

  return {
    ...config,
    scale: {
      ...config.scale,
      ...tuning.scale,
    },
  };
}

function selectView(fixture: DemoFixture, viewId?: string): DemoFixtureView | undefined {
  const views = fixture.views ?? [];
  if (!views.length) {
    return undefined;
  }
  return views.find((view) => view.id === viewId) ?? views[0];
}

function entityCount(config: HeatmapCardConfig): number {
  return config.entities?.length ?? (config.entity ? 1 : 0);
}

async function loadLocalFixture(): Promise<DemoFixture | null> {
  try {
    const response = await fetch("./fixtures/local-real.json", { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as DemoFixture;
  } catch {
    return null;
  }
}

function fixtureToHass(fixture: DemoFixture, activeConfig: HeatmapCardConfig): HomeAssistant {
  return {
    states: fixture.states,
    locale: { language: "en-US" },
    formatEntityState: (stateObj) =>
      `${formatNumber(Number(stateObj.state))} ${String(
        stateObj.attributes.unit_of_measurement ?? "",
      )}`.trim(),
    callWS: async <T>(message: Record<string, unknown>) => {
      if (message.type !== "recorder/statistics_during_period") {
        return {} as T;
      }

      const entityIds = (message.statistic_ids as string[]) ?? [];
      const start = new Date(String(message.start_time));
      const end = new Date(String(message.end_time));
      const rows = Object.fromEntries(
        entityIds.map((entityId) => [
          entityId,
          (fixture.statistics[entityId] ?? []).filter((row) => {
            const rowStart = row.start ? new Date(row.start) : undefined;
            return rowStart && rowStart >= start && rowStart < end;
          }),
        ]),
      );
      return rows as T;
    },
    callApi: async <T>(_method: string, _path: string): Promise<T> => {
      const firstEntity = activeConfig.entities?.[0];
      const entityId =
        typeof firstEntity === "string" ? firstEntity : firstEntity?.entity ?? activeConfig.entity;
      const rows: HistoryStateRow[] = (entityId ? fixture.statistics[entityId] ?? [] : []).map(
        (row) => ({
          state: String(row.mean ?? row.state ?? 0),
          last_changed: dateValueToIso(row.start),
        }),
      );
      return [rows] as T;
    },
  };
}

function dateValueToIso(value: string | number | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === "number" ? new Date(value).toISOString() : value;
}

function buildSyntheticFixture(): DemoFixture {
  const generatedAt = new Date().toISOString();
  const config: HeatmapCardConfig = {
    title: "Power Demo",
    entities: [
      { entity: "sensor.example_power_a", name: "A" },
      { entity: "sensor.example_power_b", name: "B" },
      { entity: "sensor.example_total_power", name: "Total" },
    ],
    range: { days: 14, align: "day" },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "power", unit: "W", ignore_zero: "auto" },
    axes: { show_key: false },
    navigation: { mode: "tabs" },
  };
  const states = {
    "sensor.example_power_a": buildState("sensor.example_power_a", "Example Power A", "740", "W"),
    "sensor.example_power_b": buildState("sensor.example_power_b", "Example Power B", "635", "W"),
    "sensor.example_total_power": buildState(
      "sensor.example_total_power",
      "Example Total Power",
      "1375",
      "W",
    ),
  };
  const start = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const end = new Date();

  return {
    generated_at: generatedAt,
    note: "Generated fixture data, not Home Assistant recorder history.",
    config,
    states,
    statistics: Object.fromEntries(
      Object.keys(states).map((entityId) => [entityId, makeStatistics(entityId, start, end)]),
    ),
    source: {
      kind: "synthetic",
      days: 14,
      period: "hour",
    },
  };
}

function buildState(entityId: string, friendlyName: string, value: string, unit: string): HassEntity {
  return {
    entity_id: entityId,
    state: value,
    attributes: {
      friendly_name: friendlyName,
      device_class: "power",
      state_class: "measurement",
      unit_of_measurement: unit,
    },
  };
}

function makeStatistics(entityId: string, start: Date, end: Date): StatisticsRow[] {
  const rows: StatisticsRow[] = [];
  const multiplier = entityId.endsWith("_b") ? 0.82 : entityId.includes("total") ? 1.74 : 1;
  let cursor = new Date(start);
  cursor.setMinutes(0, 0, 0);

  while (cursor < end) {
    const hour = cursor.getHours();
    const dayOffset = Math.floor((Date.now() - cursor.getTime()) / 86_400_000);
    const daytime = Math.sin(((hour - 6) / 24) * Math.PI);
    const weekly = Math.cos((dayOffset / 7) * Math.PI * 2) * 90;
    const mean = Math.max(0, (520 + daytime * 410 + weekly) * multiplier);
    rows.push({
      start: cursor.toISOString(),
      mean: Math.round(mean),
      min: Math.round(mean * 0.82),
      max: Math.round(mean * 1.18),
    });
    cursor = new Date(cursor.getTime() + 60 * 60 * 1000);
  }

  return rows;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "unknown";
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 1,
  }).format(value);
}
