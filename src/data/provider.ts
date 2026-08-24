import { calculateRange, estimateCellCount } from "../config";
import type {
  BucketValue,
  HistoryStateRow,
  HomeAssistant,
  NormalizedConfig,
  NormalizedEntityConfig,
  ProviderResult,
  StatisticsRow,
} from "../types";
import {
  emptyBuckets,
  generateBucketWindows,
  historyRowsToBuckets,
  statisticsPeriodForInterval,
  statisticsRowsToBuckets,
  statisticsTypeForValue,
} from "./buckets";

type StatisticsResponse = Record<string, StatisticsRow[]>;
type HistoryResponse = HistoryStateRow[][];

export async function fetchHeatmapBuckets(
  hass: HomeAssistant,
  config: NormalizedConfig,
  entity: NormalizedEntityConfig,
): Promise<ProviderResult> {
  const cellCount = estimateCellCount(config);
  const range = calculateRange(config.range);
  const windows = generateBucketWindows(range, config.bucket.interval);

  if (cellCount > config.data.max_cells) {
    return {
      source: "current",
      buckets: emptyBuckets(windows, "current"),
      warning: `This heatmap would render ${cellCount.toLocaleString()} cells. Raise data.max_cells to load it.`,
    };
  }

  const provider = config.data.provider;
  const canUseStatistics = statisticsTypeForValue(config.bucket.value) !== null;

  if ((provider === "auto" || provider === "statistics") && canUseStatistics) {
    try {
      const buckets = await fetchStatisticsBuckets(hass, config, entity, windows);
      if (buckets.some((bucket) => bucket.value !== null) || provider === "statistics") {
        return { source: "statistics", buckets };
      }
    } catch (error) {
      if (provider === "statistics") {
        return {
          source: "statistics",
          buckets: emptyBuckets(windows, "statistics"),
          warning: messageFromError(error, "Statistics query failed."),
        };
      }
    }
  }

  if (provider === "auto" || provider === "history") {
    return fetchHistoryBuckets(hass, config, entity, windows);
  }

  return {
    source: "current",
    buckets: emptyBuckets(windows, "current"),
    warning: "No supported data provider is available for this bucket value yet.",
  };
}

async function fetchStatisticsBuckets(
  hass: HomeAssistant,
  config: NormalizedConfig,
  entity: NormalizedEntityConfig,
  windows: Array<{ start: Date; end: Date }>,
): Promise<BucketValue[]> {
  const statType = statisticsTypeForValue(config.bucket.value);
  if (!statType) {
    return emptyBuckets(windows, "statistics");
  }

  const range = calculateRange(config.range);
  const response = await hass.callWS<StatisticsResponse>({
    type: "recorder/statistics_during_period",
    start_time: range.start.toISOString(),
    end_time: range.end.toISOString(),
    statistic_ids: [entity.entity],
    period: statisticsPeriodForInterval(config.bucket.interval),
    types: [statType],
  });
  const rows = response[entity.entity] ?? [];
  return statisticsRowsToBuckets(windows, rows, config.bucket.value, config.missing.mode);
}

async function fetchHistoryBuckets(
  hass: HomeAssistant,
  config: NormalizedConfig,
  entity: NormalizedEntityConfig,
  windows: Array<{ start: Date; end: Date }>,
): Promise<ProviderResult> {
  const range = calculateRange(config.range);
  const hours = (range.end.getTime() - range.start.getTime()) / 3_600_000;

  if (!hass.callApi) {
    return {
      source: "history",
      buckets: emptyBuckets(windows, "history"),
      warning: "This Home Assistant object does not expose callApi for history fallback.",
    };
  }

  if (hours > config.data.raw_history_hours) {
    return {
      source: "history",
      buckets: emptyBuckets(windows, "history"),
      warning: `Raw history fallback is capped at ${config.data.raw_history_hours} hours by default. Use recorder statistics or reduce range.`,
    };
  }

  try {
    // hass.callApi serializes its parameters argument into the request body for
    // every HTTP method, and fetch() rejects GET requests that carry a body, so
    // the history query must be encoded into the path instead.
    const query = new URLSearchParams({
      end_time: range.end.toISOString(),
      filter_entity_id: entity.entity,
    });
    const response = await hass.callApi<HistoryResponse>(
      "GET",
      `history/period/${range.start.toISOString()}?${query.toString()}&minimal_response&no_attributes`,
    );
    const rows = response.flat();
    return {
      source: "history",
      buckets: historyRowsToBuckets(windows, rows, config.bucket.value, config.missing.mode),
    };
  } catch (error) {
    return {
      source: "history",
      buckets: emptyBuckets(windows, "history"),
      warning: messageFromError(error, "History fallback failed."),
    };
  }
}

function messageFromError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

