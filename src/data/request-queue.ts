export interface HeatmapRequestQueueState {
  active: number;
  queued: number;
  maxConcurrent: number;
}

interface QueueOptions {
  maxConcurrent?: number;
  onQueued?: (state: HeatmapRequestQueueState) => void;
  onStart?: (state: HeatmapRequestQueueState) => void;
}

interface QueueItem<T> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  options: Required<Pick<QueueOptions, "maxConcurrent">> &
    Pick<QueueOptions, "onQueued" | "onStart">;
}

const DEFAULT_MAX_CONCURRENT = 2;
const HARD_MAX_CONCURRENT = 8;

let activeRequests = 0;
const queue: Array<QueueItem<unknown>> = [];

export function scheduleHeatmapRequest<T>(
  task: () => Promise<T>,
  options: QueueOptions = {},
): Promise<T> {
  const normalizedOptions = {
    ...options,
    maxConcurrent: normalizeMaxConcurrent(options.maxConcurrent),
  };

  return new Promise<T>((resolve, reject) => {
    queue.push({
      task,
      resolve,
      reject,
      options: normalizedOptions,
    } as QueueItem<unknown>);
    normalizedOptions.onQueued?.(queueState(normalizedOptions.maxConcurrent));
    pumpQueue();
  });
}

export function heatmapRequestQueueState(maxConcurrent = DEFAULT_MAX_CONCURRENT): HeatmapRequestQueueState {
  return queueState(normalizeMaxConcurrent(maxConcurrent));
}

export function normalizeMaxConcurrent(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_MAX_CONCURRENT;
  }
  return Math.min(HARD_MAX_CONCURRENT, Math.max(1, Math.floor(value)));
}

export function resetHeatmapRequestQueueForTests(): void {
  activeRequests = 0;
  queue.splice(0, queue.length);
}

function pumpQueue(): void {
  const next = queue[0];
  if (!next || activeRequests >= next.options.maxConcurrent) {
    return;
  }

  queue.shift();
  activeRequests += 1;
  next.options.onStart?.(queueState(next.options.maxConcurrent));

  Promise.resolve()
    .then(next.task)
    .then(next.resolve, next.reject)
    .finally(() => {
      activeRequests -= 1;
      pumpQueue();
    });
}

function queueState(maxConcurrent: number): HeatmapRequestQueueState {
  return {
    active: activeRequests,
    queued: queue.length,
    maxConcurrent,
  };
}
