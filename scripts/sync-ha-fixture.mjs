#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const defaults = {
  days: 14,
  config: "demo/fixtures/local-sync-config.json",
  out: "demo/fixtures/local-real.json",
  sample: {
    enabled: false,
    max_types: 16,
    per_type: 3,
    probe_per_type: 24,
  },
};

const statisticTypes = ["mean", "min", "max", "state", "sum", "change"];

const groupOrder = [
  "pinned",
  "power",
  "energy_delta",
  "temperature",
  "humidity",
  "battery",
  "percent_health",
  "percent_utilization",
  "filter_dp",
  "pressure",
  "signal_quality",
  "voltage",
  "current",
  "distance",
  "duration",
  "data_rate",
  "data_size_delta",
  "data_size",
  "frequency",
  "illuminance",
  "air_quality",
  "auto",
];

const groupDefinitions = {
  pinned: {
    label: "Pinned entities",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  power: {
    label: "Power",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "power", ignore_zero: "auto" },
  },
  energy_delta: {
    label: "Energy change",
    range: { days: 30 },
    bucket: { interval: "day", value: "change" },
    scale: { preset: "energy_delta", ignore_zero: "auto" },
  },
  temperature: {
    label: "Temperature",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "temperature", ignore_zero: false },
  },
  humidity: {
    label: "Humidity",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "humidity", min: 0, max: 100, unit: "%", ignore_zero: false },
  },
  battery: {
    label: "Battery",
    range: { days: 30 },
    bucket: { interval: "day", value: "min" },
    scale: { preset: "battery", min: 0, max: 100, unit: "%", ignore_zero: false },
  },
  percent_health: {
    label: "Percent health",
    range: { days: 30 },
    bucket: { interval: "day", value: "min" },
    scale: { preset: "percent_health", min: 0, max: 100, unit: "%", ignore_zero: false },
  },
  percent_utilization: {
    label: "Percent utilization",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: {
      preset: "percent_utilization",
      min: 0,
      max: 100,
      unit: "%",
      ignore_zero: false,
    },
  },
  filter_dp: {
    label: "Filter differential pressure",
    range: { days: 14 },
    bucket: { interval: "hour", value: "max" },
    scale: { preset: "filter_dp", ignore_zero: "auto" },
  },
  pressure: {
    label: "Pressure",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  signal_quality: {
    label: "Signal quality",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "signal_quality", ignore_zero: "auto" },
  },
  voltage: {
    label: "Voltage",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  current: {
    label: "Current",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  distance: {
    label: "Distance",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  duration: {
    label: "Duration",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  data_rate: {
    label: "Data rate",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  data_size_delta: {
    label: "Data size change",
    range: { days: 30 },
    bucket: { interval: "day", value: "change" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  data_size: {
    label: "Data size",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  frequency: {
    label: "Frequency",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  illuminance: {
    label: "Illuminance",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  air_quality: {
    label: "Air quality",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
  auto: {
    label: "Other numeric",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "auto", ignore_zero: "auto" },
  },
};

const args = parseArgs(process.argv.slice(2));
const configPath = args.config ?? defaults.config;
const fileConfig = await readJsonConfig(configPath);
const envPath = args.env ?? fileConfig.env ?? process.env.HA_FIXTURE_ENV;
const outPath = args.out ?? fileConfig.out ?? defaults.out;
const days = Number(args.days ?? fileConfig.days ?? defaults.days);
const pinnedEntities = args.entities.length ? args.entities : (fileConfig.entities ?? []);
const sampleConfig = normalizeSampleConfig(fileConfig.sample, args);
const env = envPath ? await readEnvFile(envPath) : {};
const haUrl = env.HA_URL ?? env.HOMEASSISTANT_URL ?? process.env.HA_URL ?? process.env.HOMEASSISTANT_URL;
const token = env.HA_TOKEN ?? env.HOMEASSISTANT_TOKEN ?? process.env.HA_TOKEN ?? process.env.HOMEASSISTANT_TOKEN;

if (!haUrl || !token) {
  throw new Error("Missing HA_URL or HA_TOKEN. Provide --env, HA_FIXTURE_ENV, or environment variables.");
}

if (!sampleConfig.enabled && pinnedEntities.length === 0) {
  throw new Error("No entities configured. Provide --entity, enable --sample, or use an ignored local sync config.");
}

const generatedAt = new Date();
const end = startOfNextLocalDay(generatedAt);
const start = subtractLocalDays(end, days);
const allStates = await fetchAllStates(haUrl, token);
const allStatesById = new Map(allStates.map((state) => [state.entity_id, state]));
const statistics = {};
const views = [];
const sampleGroups = [];

if (pinnedEntities.length > 0) {
  assertEntitiesExist(allStatesById, pinnedEntities);
  const pinnedDefinition = {
    ...groupDefinitions.pinned,
    range: { days },
  };
  Object.assign(
    statistics,
    await fetchStatistics(haUrl, token, {
      start,
      end,
      entities: pinnedEntities,
      period: pinnedDefinition.bucket.interval,
      types: statisticTypes,
    }),
  );
  views.push(buildView("pinned", pinnedDefinition, allStatesById, pinnedEntities));
}

if (sampleConfig.enabled) {
  const statisticIds = await fetchStatisticIds(haUrl, token);
  const selected = await collectSampleGroups({
    haUrl,
    token,
    end: generatedAt,
    statesById: allStatesById,
    statisticIds,
    sampleConfig,
    excludeEntities: new Set(pinnedEntities),
  });

  for (const group of selected) {
    Object.assign(statistics, group.statistics);
    views.push(buildView(group.id, group.definition, allStatesById, group.entities));
    sampleGroups.push({
      id: group.id,
      label: group.definition.label,
      candidates: group.candidate_count,
      entities: group.entities,
      bucket: group.definition.bucket,
    });
  }
}

const selectedEntities = unique(views.flatMap((view) => configEntities(view.config)));
if (selectedEntities.length === 0) {
  throw new Error("No recorder-backed sample entities produced usable statistic rows.");
}
const states = buildStateMap(allStatesById, selectedEntities);
const config = views[0]?.config ?? buildConfig({
  title: "Local HA Fixture",
  statesById: allStatesById,
  entities: selectedEntities,
  definition: {
    ...groupDefinitions.auto,
    range: { days },
  },
});

const fixture = {
  generated_at: generatedAt.toISOString(),
  source: {
    kind: sampleConfig.enabled
      ? "home_assistant_recorder_metric_samples"
      : "home_assistant_recorder_statistics",
    url: stripTrailingSlash(haUrl),
    period: "mixed",
    days,
    statistic_types: statisticTypes,
    sample: sampleConfig.enabled
      ? {
          seed: sampleConfig.seed,
          max_types: sampleConfig.max_types,
          per_type: sampleConfig.per_type,
          probe_per_type: sampleConfig.probe_per_type,
          groups: sampleGroups,
        }
      : undefined,
  },
  note: "Local-only static Home Assistant fixture. Do not commit this file.",
  config,
  views,
  states,
  statistics: pickStatistics(statistics, selectedEntities),
};

await mkdir(dirname(resolve(outPath)), { recursive: true });
await writeFile(outPath, `${JSON.stringify(fixture, null, 2)}\n`, "utf8");

const rows = Object.values(fixture.statistics).reduce((total, entityRows) => total + entityRows.length, 0);
console.log(`Wrote ${outPath}`);
console.log(`Entities: ${selectedEntities.length}; views: ${views.length}; statistic rows: ${rows}`);
console.log(`Range: ${start.toISOString()} to ${end.toISOString()}`);
if (sampleConfig.enabled) {
  for (const group of sampleGroups) {
    console.log(`- ${group.label}: ${group.entities.length} entities`);
  }
}

function parseArgs(rawArgs) {
  const parsed = {
    entities: [],
    metric_types: [],
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--entity") {
      const value = rawArgs[index + 1];
      if (!value) {
        throw new Error("--entity requires a value");
      }
      parsed.entities.push(value);
      index += 1;
    } else if (arg?.startsWith("--entity=")) {
      parsed.entities.push(arg.slice("--entity=".length));
    } else if (arg === "--env") {
      parsed.env = requireValue(rawArgs, index, "--env");
      index += 1;
    } else if (arg?.startsWith("--env=")) {
      parsed.env = arg.slice("--env=".length);
    } else if (arg === "--config") {
      parsed.config = requireValue(rawArgs, index, "--config");
      index += 1;
    } else if (arg?.startsWith("--config=")) {
      parsed.config = arg.slice("--config=".length);
    } else if (arg === "--out") {
      parsed.out = requireValue(rawArgs, index, "--out");
      index += 1;
    } else if (arg?.startsWith("--out=")) {
      parsed.out = arg.slice("--out=".length);
    } else if (arg === "--days") {
      parsed.days = requireValue(rawArgs, index, "--days");
      index += 1;
    } else if (arg?.startsWith("--days=")) {
      parsed.days = arg.slice("--days=".length);
    } else if (arg === "--sample") {
      parsed.sample = true;
    } else if (arg === "--no-sample") {
      parsed.sample = false;
    } else if (arg === "--sample-per-type") {
      parsed.sample_per_type = requireValue(rawArgs, index, "--sample-per-type");
      index += 1;
    } else if (arg?.startsWith("--sample-per-type=")) {
      parsed.sample_per_type = arg.slice("--sample-per-type=".length);
    } else if (arg === "--sample-max-types") {
      parsed.sample_max_types = requireValue(rawArgs, index, "--sample-max-types");
      index += 1;
    } else if (arg?.startsWith("--sample-max-types=")) {
      parsed.sample_max_types = arg.slice("--sample-max-types=".length);
    } else if (arg === "--sample-seed") {
      parsed.sample_seed = requireValue(rawArgs, index, "--sample-seed");
      index += 1;
    } else if (arg?.startsWith("--sample-seed=")) {
      parsed.sample_seed = arg.slice("--sample-seed=".length);
    } else if (arg === "--metric-type") {
      parsed.metric_types.push(requireValue(rawArgs, index, "--metric-type"));
      index += 1;
    } else if (arg?.startsWith("--metric-type=")) {
      parsed.metric_types.push(arg.slice("--metric-type=".length));
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function requireValue(args, index, name) {
  const value = args[index + 1];
  if (!value) {
    throw new Error(`${name} requires a value`);
  }
  return value;
}

function printHelp() {
  console.log(`Usage:
  npm run sync:ha-fixture -- [options]

Options:
  --config <path>              Local JSON config. Default ${defaults.config}
  --env <path>                 Home Assistant env file with HA_URL and HA_TOKEN
  --out <path>                 Output fixture path
  --days <number>              Lookback days, default ${defaults.days}
  --entity <id>                Pinned entity to include. Can be repeated.
  --sample                     Discover random recorder-backed metric samples
  --sample-per-type <number>   Sample size per metric type, default ${defaults.sample.per_type}
  --sample-max-types <number>  Maximum metric groups, default ${defaults.sample.max_types}
  --sample-seed <text>         Optional deterministic sample seed
  --metric-type <id>           Limit sampling to a metric group. Can be repeated.

Example ignored config:
  {
    "env": "demo/fixtures/homeassistant.env",
    "entities": ["sensor.example_power"],
    "days": 14,
    "sample": {
      "enabled": true,
      "per_type": 3,
      "max_types": 16
    }
  }
`);
}

function normalizeSampleConfig(config = {}, parsedArgs) {
  const enabled =
    typeof parsedArgs.sample === "boolean"
      ? parsedArgs.sample
      : Boolean(config.enabled ?? defaults.sample.enabled);
  const perType = toPositiveInteger(
    parsedArgs.sample_per_type ?? config.per_type,
    defaults.sample.per_type,
  );
  const maxTypes = toPositiveInteger(
    parsedArgs.sample_max_types ?? config.max_types,
    defaults.sample.max_types,
  );
  const probePerType = toPositiveInteger(
    config.probe_per_type,
    Math.max(defaults.sample.probe_per_type, perType * 6),
  );
  const seed = String(parsedArgs.sample_seed ?? config.seed ?? Date.now());
  const metricTypes = parsedArgs.metric_types.length
    ? parsedArgs.metric_types
    : Array.isArray(config.metric_types)
      ? config.metric_types
      : [];

  return {
    enabled,
    per_type: perType,
    max_types: maxTypes,
    probe_per_type: Math.max(probePerType, perType),
    seed,
    metric_types: metricTypes.map((type) => slugify(type)),
  };
}

function toPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

async function readJsonConfig(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function readEnvFile(path) {
  const text = await readFile(path, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) {
      continue;
    }
    env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
  }
  return env;
}

async function fetchAllStates(haUrl, token) {
  const response = await fetch(`${stripTrailingSlash(haUrl)}/api/states`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Home Assistant states request failed: ${response.status}`);
  }

  return response.json();
}

async function fetchStatisticIds(haUrl, token) {
  const response = await callWebSocket(haUrl, token, {
    type: "recorder/list_statistic_ids",
  });
  return response ?? [];
}

async function fetchStatistics(haUrl, token, request) {
  return (
    (await callWebSocket(haUrl, token, {
      type: "recorder/statistics_during_period",
      start_time: request.start.toISOString(),
      end_time: request.end.toISOString(),
      statistic_ids: request.entities,
      period: request.period,
      types: request.types,
    })) ?? {}
  );
}

async function callWebSocket(haUrl, token, message) {
  const wsUrl = toWebSocketUrl(haUrl);
  const ws = new WebSocket(`${wsUrl}/api/websocket`);
  let nextId = 1;

  try {
    await waitForMessage(ws, (incoming) => incoming.type === "auth_required");
    ws.send(JSON.stringify({ type: "auth", access_token: token }));
    await waitForMessage(ws, (incoming) => incoming.type === "auth_ok");

    const id = nextId++;
    ws.send(JSON.stringify({ id, ...message }));

    const response = await waitForMessage(ws, (incoming) => incoming.id === id);
    if (!response.success) {
      throw new Error(`Home Assistant WebSocket request failed: ${JSON.stringify(response.error ?? response)}`);
    }

    return response.result;
  } finally {
    ws.close();
  }
}

function waitForMessage(ws, predicate) {
  return new Promise((resolvePromise, rejectPromise) => {
    const timeout = setTimeout(() => {
      cleanup();
      rejectPromise(new Error("Timed out waiting for Home Assistant WebSocket response"));
    }, 30_000);

    const onMessage = (event) => {
      const message = JSON.parse(String(event.data));
      if (!predicate(message)) {
        return;
      }
      cleanup();
      resolvePromise(message);
    };
    const onError = () => {
      cleanup();
      rejectPromise(new Error("Home Assistant WebSocket error"));
    };

    function cleanup() {
      clearTimeout(timeout);
      ws.removeEventListener("message", onMessage);
      ws.removeEventListener("error", onError);
    }

    ws.addEventListener("message", onMessage);
    ws.addEventListener("error", onError);
  });
}

async function collectSampleGroups({
  haUrl,
  token,
  end,
  statesById,
  statisticIds,
  sampleConfig,
  excludeEntities,
}) {
  const grouped = new Map();
  for (const statistic of statisticIds) {
    const entityId = statistic.statistic_id;
    const state = statesById.get(entityId);
    if (!isSampleCandidate(state, statistic) || excludeEntities.has(entityId)) {
      continue;
    }

    const groupId = classifyMetricGroup(state, statistic);
    if (sampleConfig.metric_types.length > 0 && !sampleConfig.metric_types.includes(groupId)) {
      continue;
    }

    const group = grouped.get(groupId) ?? [];
    group.push({ entityId, state, statistic });
    grouped.set(groupId, group);
  }

  const groupEntries = [...grouped.entries()]
    .map(([id, candidates]) => ({
      id,
      definition: getGroupDefinition(id),
      candidates,
    }))
    .sort((left, right) => {
      const orderDelta = groupRank(left.id) - groupRank(right.id);
      return orderDelta || right.candidates.length - left.candidates.length || left.id.localeCompare(right.id);
    })
    .slice(0, sampleConfig.max_types);

  const selected = [];
  for (const group of groupEntries) {
    const probeCandidates = shuffle(group.candidates, `${sampleConfig.seed}:${group.id}`).slice(
      0,
      sampleConfig.probe_per_type,
    );
    const range = calculateGroupRange(group.definition, end);
    const probeStatistics = await fetchStatistics(haUrl, token, {
      start: range.start,
      end: range.end,
      entities: probeCandidates.map((candidate) => candidate.entityId),
      period: group.definition.bucket.interval,
      types: statisticTypes,
    });
    const usable = probeCandidates.filter((candidate) =>
      hasUsableRows(probeStatistics[candidate.entityId], group.definition.bucket.value),
    );
    const entities = usable.slice(0, sampleConfig.per_type).map((candidate) => candidate.entityId);
    if (entities.length === 0) {
      continue;
    }
    selected.push({
      id: group.id,
      definition: group.definition,
      candidate_count: group.candidates.length,
      entities,
      statistics: pickStatistics(probeStatistics, entities),
    });
  }

  return selected;
}

function isSampleCandidate(state, statistic) {
  if (!state || typeof state.entity_id !== "string") {
    return false;
  }
  if (!state.entity_id.startsWith("sensor.")) {
    return false;
  }
  if (!statistic?.has_mean && !statistic?.has_sum) {
    return false;
  }

  const value = Number(state.state);
  return Number.isFinite(value);
}

function classifyMetricGroup(state, statistic) {
  const entityId = state.entity_id.toLowerCase();
  const attrs = state.attributes ?? {};
  const name = String(attrs.friendly_name ?? statistic.name ?? entityId).toLowerCase();
  const deviceClass = normalizeMetricToken(attrs.device_class ?? statistic.unit_class);
  const unit = normalizeUnit(
    attrs.unit_of_measurement ??
      statistic.display_unit_of_measurement ??
      statistic.statistics_unit_of_measurement,
  );

  if (deviceClass === "battery" || name.includes("battery")) {
    return "battery";
  }
  if (deviceClass === "temperature" || unit === "\u00b0f" || unit === "\u00b0c") {
    return "temperature";
  }
  if (deviceClass === "humidity") {
    return "humidity";
  }
  if (deviceClass === "power" || unit === "w" || unit === "kw") {
    return "power";
  }
  if (deviceClass === "energy" || unit === "wh" || unit === "kwh") {
    return "energy_delta";
  }
  if (
    deviceClass === "pressure" ||
    deviceClass === "atmospheric_pressure" ||
    unit.includes("pa") ||
    unit.includes("inh2o") ||
    unit.includes("inhg")
  ) {
    if (name.includes("filter") || name.includes("static") || name.includes("differential") || name.includes("dp")) {
      return "filter_dp";
    }
    return "pressure";
  }
  if (deviceClass === "signal_strength" || unit === "dbm" || unit === "lqi" || unit === "db") {
    return "signal_quality";
  }
  if (unit === "%") {
    if (name.includes("life") || name.includes("health")) {
      return "percent_health";
    }
    return "percent_utilization";
  }
  if (deviceClass === "voltage") {
    return "voltage";
  }
  if (deviceClass === "current") {
    return "current";
  }
  if (deviceClass === "distance") {
    return "distance";
  }
  if (deviceClass === "duration") {
    return "duration";
  }
  if (deviceClass === "data_rate") {
    return "data_rate";
  }
  if (deviceClass === "data_size" || deviceClass === "information") {
    return statistic.has_sum && !statistic.has_mean ? "data_size_delta" : "data_size";
  }
  if (deviceClass === "frequency") {
    return "frequency";
  }
  if (deviceClass === "illuminance") {
    return "illuminance";
  }
  if (
    ["carbon_dioxide", "carbon_monoxide", "pm1", "pm10", "pm25", "volatile_organic_compounds"].includes(
      deviceClass,
    )
  ) {
    return "air_quality";
  }

  return groupDefinitions[deviceClass] ? deviceClass : "auto";
}

function normalizeMetricToken(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeUnit(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getGroupDefinition(id) {
  return groupDefinitions[id] ?? {
    ...groupDefinitions.auto,
    label: titleCase(id.replace(/^auto_/, "")),
  };
}

function groupRank(id) {
  const index = groupOrder.indexOf(id);
  return index === -1 ? groupOrder.length : index;
}

function calculateGroupRange(definition, end) {
  const days = Number(definition.range?.days ?? defaults.days);
  const hours = Number(definition.range?.hours ?? 0);
  const rangeEnd = definition.range?.align === "rolling" || hours > 0 ? end : startOfNextLocalDay(end);
  const durationMs = hours > 0 ? hours * 60 * 60 * 1000 : days * 24 * 60 * 60 * 1000;
  return {
    start: hours > 0 ? new Date(rangeEnd.getTime() - durationMs) : subtractLocalDays(rangeEnd, days),
    end: rangeEnd,
  };
}

function startOfNextLocalDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + 1);
  return next;
}

function subtractLocalDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function hasUsableRows(rows = [], bucketValue) {
  const key = statisticKeyForBucketValue(bucketValue);
  return rows.some((row) => {
    const value = row?.[key];
    return typeof value === "number" && Number.isFinite(value);
  });
}

function statisticKeyForBucketValue(bucketValue) {
  if (bucketValue === "last") {
    return "state";
  }
  return bucketValue;
}

function buildView(id, definition, statesById, entities) {
  return {
    id,
    label: definition.label,
    entity_count: entities.length,
    config: buildConfig({
      title: `Local HA ${definition.label}`,
      statesById,
      entities,
      definition,
    }),
  };
}

function buildConfig({ title, statesById, entities, definition }) {
  return {
    title,
    entities: entities.map((entityId) => buildEntityConfig(statesById.get(entityId), definition)),
    range: {
      ...definition.range,
      align: definition.range?.align ?? "day",
    },
    bucket: definition.bucket,
    scale: {
      ...definition.scale,
      unit: undefined,
    },
    axes: { show_key: false },
    navigation: { mode: entities.length > 4 ? "dropdown" : "tabs" },
  };
}

function buildEntityConfig(state, definition) {
  const unit = String(state?.attributes?.unit_of_measurement ?? "").trim() || undefined;
  const scale = {
    ...definition.scale,
    unit: definition.scale.unit ?? unit,
  };

  if (definition.scale.preset === "temperature" && unit?.toLowerCase() === "\u00b0c") {
    scale.stops = [
      { value: 13, color: "#315f9d", label: "Cool" },
      { value: 20, color: "#58a4b0", label: "Comfort" },
      { value: 24, color: "#f2c14e", label: "Warm" },
      { value: 29, color: "#d94841", label: "Hot" },
    ];
  }

  return {
    entity: state.entity_id,
    name: String(state?.attributes?.friendly_name ?? state.entity_id),
    scale,
  };
}

function buildStateMap(statesById, entities) {
  const stateMap = {};
  for (const entityId of entities) {
    const state = statesById.get(entityId);
    if (!state) {
      throw new Error(`Entity not found: ${entityId}`);
    }
    stateMap[entityId] = {
      entity_id: state.entity_id,
      state: state.state,
      last_changed: state.last_changed,
      last_updated: state.last_updated,
      attributes: {
        device_class: state.attributes?.device_class,
        friendly_name: state.attributes?.friendly_name ?? state.entity_id,
        state_class: state.attributes?.state_class,
        unit_of_measurement: state.attributes?.unit_of_measurement,
      },
    };
  }
  return stateMap;
}

function assertEntitiesExist(statesById, entities) {
  for (const entityId of entities) {
    if (!statesById.has(entityId)) {
      throw new Error(`Entity not found: ${entityId}`);
    }
  }
}

function pickStatistics(statistics, entities) {
  return Object.fromEntries(entities.map((entityId) => [entityId, statistics[entityId] ?? []]));
}

function configEntities(config) {
  return (config.entities ?? []).map((entry) => (typeof entry === "string" ? entry : entry.entity));
}

function unique(values) {
  return [...new Set(values)];
}

function shuffle(values, seed) {
  const random = seededRandom(seed);
  return values
    .map((value) => ({ value, sort: random() }))
    .sort((left, right) => left.sort - right.sort)
    .map((entry) => entry.value);
}

function seededRandom(seed) {
  let state = hashString(seed) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function titleCase(value) {
  return String(value)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function toWebSocketUrl(haUrl) {
  const parsed = new URL(stripTrailingSlash(haUrl));
  parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
  return stripTrailingSlash(parsed.toString());
}
