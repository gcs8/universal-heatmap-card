import type { HeatmapCardConfig } from "./types";

export const DEBUG_STORAGE_KEY = "universal-heatmap-card:debug";

export function isDebugEnabled(config: Pick<HeatmapCardConfig, "debug"> | undefined): boolean {
  if (config?.debug === true) {
    return true;
  }
  if (config?.debug === false || typeof window === "undefined") {
    return false;
  }

  try {
    const value = window.localStorage?.getItem(DEBUG_STORAGE_KEY);
    return value === "1" || value === "true";
  } catch {
    return false;
  }
}

export function debugNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

export function roundMs(value: number): number {
  return Math.round(value * 10) / 10;
}

export function debugLog(
  enabled: boolean,
  message: string,
  details?: Record<string, unknown>,
): void {
  if (!enabled) {
    return;
  }

  if (details) {
    console.debug(`[Universal Heatmap Card] ${message}`, details);
    return;
  }
  console.debug(`[Universal Heatmap Card] ${message}`);
}
