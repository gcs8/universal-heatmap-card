import { LitElement, nothing } from "lit";
import { calculateRange, normalizeConfig } from "../src/config";
import { generateBucketWindows } from "../src/data/buckets";
import { estimateCanvasHeight } from "../src/layout";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetHeatmapRequestQueueForTests, scheduleHeatmapRequest } from "../src/data/request-queue";
import { buildScale } from "../src/scale";
import type { BucketValue, HeatmapRenderLayout, NormalizedConfig, ProviderResult, ScaleModel, TooltipState } from "../src/types";

vi.mock("../src/data/provider", () => ({ fetchHeatmapBuckets: vi.fn() }));
const { fetchHeatmapBuckets } = await import("../src/data/provider");
// Lit's Node HTMLElement shim is sufficient for these method-level contracts.
// Real rendering and native ResizeObserver behavior are qualified separately.
vi.stubGlobal("window", { devicePixelRatio: 2 });
const { UniversalHeatmapCard } = await import("../src/card");

type Card = InstanceType<typeof UniversalHeatmapCard>;
interface Internals {
  _normalized: NormalizedConfig;
  _activeIndex: number;
  _buckets: BucketValue[];
  _scale?: ScaleModel;
  _warning?: string;
  _error?: string;
  _loading: boolean;
  _inFlightKey?: string;
  _renderLayout?: HeatmapRenderLayout;
  _placement?: unknown;
  _renderSummary(): unknown;
  _renderLegend(): unknown;
  _requestActiveSeriesLoad(): void;
  _tooltip?: TooltipState;
  _cache: Map<string, { result: ProviderResult; scale: ScaleModel; loadedAt: number }>;
  _seriesCacheKey(config: NormalizedConfig, entity: NormalizedConfig["entities"][number]): string;
  _loadActiveSeries(): Promise<void>;
  _setupResizeObserver(): void;
  _drawHeatmap(): void;
  _drawAxes(ctx: CanvasRenderingContext2D, layout: HeatmapRenderLayout): void;
  _handleCanvasMove(event: MouseEvent): void;
}
const inside = (card: Card) => card as unknown as Internals;
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
function result(value: number, warning?: string): ProviderResult {
  return {
    source: "statistics", warning,
    buckets: [{ start: new Date(2026, 0, 1, 12), end: new Date(2026, 0, 1, 13), value, source: "statistics", quality: "ok" }],
  };
}
function cardFixture(): Card {
  const card = new UniversalHeatmapCard();
  const state = inside(card);
  state._normalized = normalizeConfig({
    entities: ["sensor.a", "sensor.b"], bucket: { interval: "hour" },
    data: { defer_until_visible: false },
  });
  card.hass = { states: {}, callWS: vi.fn() };
  return card;
}
function cacheB(card: Card): ProviderResult {
  const state = inside(card);
  const data = result(200, "B warning");
  const key = state._seriesCacheKey(state._normalized, state._normalized.entities[1]!);
  state._cache.set(key, { result: data, scale: buildScale(data.buckets, state._normalized.scale), loadedAt: Date.now() });
  return data;
}
async function select(card: Card, index: number): Promise<void> {
  inside(card)._activeIndex = index;
  return inside(card)._loadActiveSeries();
}

beforeEach(() => {
  vi.stubGlobal("window", { devicePixelRatio: 2 });
  resetHeatmapRequestQueueForTests();
  vi.mocked(fetchHeatmapBuckets).mockReset();
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function canvasFixture(card: Card, width = 640) {
  const state = inside(card);
  const wrap = { clientWidth: width };
  const ctx = {
    setTransform: vi.fn(), clearRect: vi.fn(), fillRect: vi.fn(),
    strokeText: vi.fn(),
    save: vi.fn(), restore: vi.fn(), fillText: vi.fn(), beginPath: vi.fn(),
    moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(),
  };
  const canvas = { parentElement: wrap, style: {}, width: 0, height: 0, getContext: () => ctx };
  Object.defineProperty(card, "renderRoot", { configurable: true, value: {
    querySelector: (selector: string) => selector === "canvas" ? canvas : selector === ".canvas-wrap" ? wrap : null,
  } });
  state._buckets = Array.from({ length: 24 }, (_, hour) => ({
    ...result(hour).buckets[0]!, start: new Date(2026, 0, 1, hour), end: new Date(2026, 0, 1, hour + 1),
  }));
  state._scale = buildScale(state._buckets, state._normalized.scale);
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "" }));
  return { wrap, ctx, canvas };
}

describe("card load ownership", () => {
  function expectEmptyDisplay(state: Internals) {
    expect(state._buckets).toEqual([]);
    expect(state._scale).toBeUndefined();
    expect(state._renderLayout).toBeUndefined();
    expect(state._placement).toBeUndefined();
    expect(state._tooltip).toBeUndefined();
    expect(state._renderSummary()).toBe(nothing);
    expect(state._renderLegend()).toBe(nothing);
  }

  it.each(["resolve", "reject"] as const)("clears displayed A while uncached B is queued, then %s", async (completion) => {
    const card = cardFixture();
    const state = inside(card);
    const { ctx, canvas } = canvasFixture(card);
    vi.mocked(fetchHeatmapBuckets).mockResolvedValueOnce(result(10));
    await select(card, 0);
    state._drawHeatmap();
    state._tooltip = { bucket: state._buckets[0]!, label: "A", x: 1, y: 1 };
    expect(state._renderSummary()).not.toBe(nothing);
    expect(state._renderLegend()).not.toBe(nothing);
    ctx.clearRect.mockClear();
    state._normalized.data.max_concurrent_requests = 1;
    const blocker = deferred<void>();
    const blocked = scheduleHeatmapRequest(() => blocker.promise, { maxConcurrent: 1 });
    const pending = deferred<ProviderResult>();
    vi.mocked(fetchHeatmapBuckets).mockReturnValueOnce(pending.promise);
    const load = select(card, 1);
    // Clearing must not wait for the shared queue, a provider result or Lit's next draw.
    expect(state._loading).toBe(true);
    expectEmptyDisplay(state);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
    blocker.resolve();
    await blocked;
    await tick();
    if (completion === "resolve") pending.resolve(result(200));
    else pending.reject(new Error("B failed"));
    await load;
    expect(state._loading).toBe(false);
    if (completion === "resolve") {
      expect(state._buckets[0]?.value).toBe(200);
      expect(state._scale).toBeDefined();
      state._drawHeatmap();
      expect(state._renderLayout).toBeDefined();
    } else {
      expect(state._error).toBe("B failed");
      expectEmptyDisplay(state);
    }
    // A remains cached and can be restored after B's success or failure.
    await select(card, 0);
    expect(state._buckets[0]?.value).toBe(10);
    expect(state._error).toBeUndefined();
  });

  it.each(["resolve", "reject"] as const)("retains same-key data during refresh, then %s", async (completion) => {
    const card = cardFixture();
    const state = inside(card);
    const { ctx } = canvasFixture(card);
    vi.mocked(fetchHeatmapBuckets).mockResolvedValueOnce(result(10));
    await select(card, 0);
    state._drawHeatmap();
    const buckets = state._buckets;
    const scale = state._scale;
    const layout = state._renderLayout;
    for (const cached of state._cache.values()) cached.loadedAt = 0;
    const pending = deferred<ProviderResult>();
    vi.mocked(fetchHeatmapBuckets).mockReturnValueOnce(pending.promise);
    ctx.clearRect.mockClear();
    const load = select(card, 0);
    expect(state._buckets).toBe(buckets);
    expect(state._scale).toBe(scale);
    expect(state._renderLayout).toBe(layout);
    expect(ctx.clearRect).not.toHaveBeenCalled();
    if (completion === "resolve") pending.resolve(result(20));
    else pending.reject(new Error("refresh failed"));
    await load;
    if (completion === "resolve") expect(state._buckets[0]?.value).toBe(20);
    else {
      // Current failures discard stale data, matching the existing bucket policy.
      expect(state._error).toBe("refresh failed");
      expectEmptyDisplay(state);
      expect(ctx.clearRect).toHaveBeenCalled();
    }
  });

  it("clears a different series even when its load is deferred until visible", async () => {
    const card = cardFixture();
    const state = inside(card);
    canvasFixture(card);
    vi.mocked(fetchHeatmapBuckets).mockResolvedValueOnce(result(10));
    await select(card, 0);
    state._drawHeatmap();
    state._normalized.data.defer_until_visible = true;
    vi.stubGlobal("IntersectionObserver", class {});
    Object.assign(state, { _visibleForLoad: false, _activeIndex: 1 });
    state._requestActiveSeriesLoad();
    expectEmptyDisplay(state);
    expect(fetchHeatmapBuckets).toHaveBeenCalledTimes(1);
  });

  it.each(["resolve", "reject"] as const)("invalidates in-flight A before deferring B, then ignores A %s", async (completion) => {
    const card = cardFixture();
    const state = inside(card);
    canvasFixture(card);
    const old = deferred<ProviderResult>();
    vi.mocked(fetchHeatmapBuckets).mockReturnValueOnce(old.promise);
    const load = select(card, 0);
    await tick();
    state._normalized.data.defer_until_visible = true;
    vi.stubGlobal("IntersectionObserver", class {});
    Object.assign(state, { _visibleForLoad: false, _activeIndex: 1 });
    state._requestActiveSeriesLoad();
    expectEmptyDisplay(state);
    if (completion === "resolve") old.resolve(result(10, "obsolete A warning"));
    else old.reject(new Error("obsolete A error"));
    await load;
    expectEmptyDisplay(state);
    expect(state._error).toBeUndefined();
    expect(state._warning).toBeUndefined();
    expect(state._loading).toBe(false);
    expect(state._inFlightKey).toBeUndefined();
    vi.mocked(fetchHeatmapBuckets).mockResolvedValueOnce(result(200));
    Object.assign(state, { _visibleForLoad: true });
    await select(card, 1);
    expect(state._buckets[0]?.value).toBe(200);
    expect(fetchHeatmapBuckets).toHaveBeenCalledTimes(2);
  });

  it("keeps a current same-key request owned when visibility defers another attempt", async () => {
    const card = cardFixture();
    const state = inside(card);
    canvasFixture(card);
    const pending = deferred<ProviderResult>();
    vi.mocked(fetchHeatmapBuckets).mockReturnValueOnce(pending.promise);
    const load = select(card, 0);
    await tick();
    const key = state._inFlightKey;
    state._normalized.data.defer_until_visible = true;
    vi.stubGlobal("IntersectionObserver", class {});
    Object.assign(state, { _visibleForLoad: false });
    state._requestActiveSeriesLoad();
    expect(state._inFlightKey).toBe(key);
    pending.resolve(result(10));
    await load;
    expect(state._buckets[0]?.value).toBe(10);
    expect(fetchHeatmapBuckets).toHaveBeenCalledTimes(1);
  });

  it.each(["resolve", "reject"] as const)("cached B owns the display after stale A %s", async (completion) => {
    const card = cardFixture();
    const state = inside(card);
    const pending = deferred<ProviderResult>();
    vi.mocked(fetchHeatmapBuckets).mockReturnValueOnce(pending.promise);
    const b = cacheB(card);
    const aLoad = select(card, 0);
    await tick();
    await select(card, 1);
    if (completion === "resolve") pending.resolve(result(1, "stale A warning"));
    else pending.reject(new Error("stale A failure"));
    await aLoad;
    expect(state._buckets).toBe(b.buckets);
    expect(state._warning).toBe("B warning");
    expect(state._error).toBeUndefined();
    expect(state._loading).toBe(false);
    expect(state._inFlightKey).toBeUndefined();
  });

  it.each(["old-first", "new-first", "old-fails"] as const)("A -> cached B -> A restarts without a hass update: %s", async (order) => {
    const card = cardFixture();
    const state = inside(card);
    const old = deferred<ProviderResult>();
    const current = deferred<ProviderResult>();
    vi.mocked(fetchHeatmapBuckets).mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    cacheB(card);
    const first = select(card, 0);
    await tick();
    await select(card, 1);
    const second = select(card, 0);
    await tick();
    expect(fetchHeatmapBuckets).toHaveBeenCalledTimes(2);
    const key = state._inFlightKey;
    expect(key).toBeDefined();
    expect(state._loading).toBe(true);
    if (order !== "new-first") {
      if (order === "old-fails") old.reject(new Error("obsolete A failed"));
      else old.resolve(result(1, "obsolete warning"));
      await first;
      // A stale same-key finally must not clear its successor's marker.
      expect(state._inFlightKey).toBe(key);
      expect(state._loading).toBe(true);
      await select(card, 0);
      expect(fetchHeatmapBuckets).toHaveBeenCalledTimes(2);
    }
    const accepted = result(42, "current warning");
    current.resolve(accepted);
    await second;
    if (order === "new-first") { old.resolve(result(1)); await first; }
    expect(state._buckets).toBe(accepted.buckets);
    expect(state._warning).toBe("current warning");
    expect(state._error).toBeUndefined();
    expect(state._loading).toBe(false);
    expect(state._inFlightKey).toBeUndefined();
  });

  it("skips invalidated queued A and starts reselected A at concurrency one", async () => {
    const card = cardFixture();
    const state = inside(card);
    state._normalized.data.max_concurrent_requests = 1;
    const blocker = deferred<void>();
    const blocked = scheduleHeatmapRequest(() => blocker.promise, { maxConcurrent: 1 });
    const accepted = result(42);
    vi.mocked(fetchHeatmapBuckets).mockResolvedValue(accepted);
    cacheB(card);
    const first = select(card, 0);
    await select(card, 1);
    const second = select(card, 0);
    blocker.resolve();
    await Promise.all([blocked, first, second]);
    expect(fetchHeatmapBuckets).toHaveBeenCalledTimes(1);
    expect(state._buckets).toBe(accepted.buckets);
    expect(state._loading).toBe(false);
  });

  it("deduplicates a still-current request and recovers from a current failure", async () => {
    const card = cardFixture();
    const pending = deferred<ProviderResult>();
    vi.mocked(fetchHeatmapBuckets).mockReturnValueOnce(pending.promise).mockResolvedValueOnce(result(42));
    const load = select(card, 0);
    await tick();
    await select(card, 0);
    expect(fetchHeatmapBuckets).toHaveBeenCalledTimes(1);
    pending.reject(new Error("current failed"));
    await load;
    expect(inside(card)._error).toBe("current failed");
    expect(inside(card)._loading).toBe(false);
    await select(card, 0);
    expect(inside(card)._error).toBeUndefined();
    expect(inside(card)._buckets[0]?.value).toBe(42);
  });
});

describe("card geometry and resize lifecycle", () => {
  it.each([
    { interval: "hour" as const, width: 208 },
    { interval: "5minute" as const, width: 448 },
    { interval: "5minute" as const, width: 528 },
    { interval: "5minute" as const, width: 208 },
    { interval: "5minute" as const, width: 48 },
  ].flatMap((entry) => [false, true, "toggle" as const].map((values) => ({ ...entry, values }))))(
    "fits every $interval cell and final hover at width $width with values=$values",
    ({ interval, width, values }) => {
      const card = cardFixture();
      const state = inside(card);
      const { ctx, canvas } = canvasFixture(card, width);
      state._normalized = normalizeConfig({
        entity: "sensor.a", range: { start: "2026-01-01", end: "2026-01-02" },
        bucket: { interval }, tiles: { show_values: values === true, show_value_toggle: values === "toggle" },
      });
      const windows = generateBucketWindows(calculateRange(state._normalized.range), interval);
      state._buckets = windows.map((window, index) => ({ ...result(index).buckets[0]!, ...window }));
      state._scale = buildScale(state._buckets, state._normalized.scale);
      state._drawHeatmap();
      const layout = state._renderLayout!;
      expect(layout.width).toBe(width);
      expect(layout.gridX + layout.gridWidth).toBeLessThanOrEqual(layout.width);
      expect(layout.height).toBe(estimateCanvasHeight(state._normalized, width));
      expect(canvas.width).toBe(layout.width * 2);
      expect(ctx.fillRect).toHaveBeenCalledTimes(state._buckets.length);
      for (const [x, y, w, h] of ctx.fillRect.mock.calls as number[][]) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x! + w!).toBeLessThanOrEqual(layout.width);
        expect(y! + h!).toBeLessThanOrEqual(layout.height);
      }
      // Axis tick anchors must also fit, including the right-aligned final tick.
      for (const [, x] of ctx.fillText.mock.calls as [string, number][]) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(layout.width);
      }
      const last = state._buckets.at(-1)!;
      const x = layout.gridX + (layout.cols - 1) * (layout.cell + layout.gap) + layout.cell / 2;
      const y = layout.gridY + (layout.rows - 1) * (layout.cell + layout.gap) + layout.cell / 2;
      expect(x).toBeLessThan(layout.width);
      state._handleCanvasMove({
        currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0, width, height: layout.height }) },
        clientX: x, clientY: y,
      } as unknown as MouseEvent);
      expect(state._tooltip?.bucket).toBe(last);
    },
  );


  it("retains distinct narrow fall-back cells and offset-disambiguated hover targets", () => {
    const previousTz = process.env.TZ;
    process.env.TZ = "America/New_York";
    try {
      const card = cardFixture();
      const state = inside(card);
      const { ctx } = canvasFixture(card, 208);
      const start = new Date("2026-11-01T04:00:00Z").getTime();
      state._buckets = Array.from({ length: 25 }, (_, index) => ({
        ...result(index).buckets[0]!,
        start: new Date(start + index * 3_600_000), end: new Date(start + (index + 1) * 3_600_000),
      }));
      state._drawHeatmap();
      const layout = state._renderLayout!;
      expect(layout.rows).toBe(1);
      expect(ctx.fillRect).toHaveBeenCalledTimes(25);
      for (const [slot, offset] of ["UTC-04:00", "UTC-05:00"].entries()) {
        state._handleCanvasMove({
          currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 208, height: layout.height }) },
          clientX: layout.gridX + layout.cell + layout.gap + (slot + 0.5) * layout.cell / 2,
          clientY: layout.gridY + layout.cell / 2,
        } as unknown as MouseEvent);
        expect(state._tooltip?.bucket).toBe(state._buckets[slot + 1]);
        expect(state._tooltip?.label).toContain(offset);
      }
    } finally {
      process.env.TZ = previousTz;
    }
  });

  it("keeps carried markers inside tiny cells with axes hidden", () => {
    const card = cardFixture();
    const state = inside(card);
    const { ctx } = canvasFixture(card, 48);
    state._normalized.bucket.interval = "5minute";
    state._normalized.axes.show = false;
    state._buckets = Array.from({ length: 48 }, () => ({ ...result(1).buckets[0]!, quality: "carried" }));
    state._drawHeatmap();
    const layout = state._renderLayout!;
    expect(layout.cell).toBe(1);
    expect(layout.gap).toBe(0);
    for (const [x, y, w, h] of ctx.fillRect.mock.calls as number[][]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x! + w!).toBeLessThanOrEqual(layout.width);
      expect(y! + h!).toBeLessThanOrEqual(layout.height);
    }
  });

  it("anchors first, middle and final hourly ticks to the named column", () => {
    const card = cardFixture();
    const { ctx } = canvasFixture(card);
    inside(card)._drawHeatmap();
    const layout = inside(card)._renderLayout!;
    const labels = ctx.fillText.mock.calls.slice(0, 5);
    const expected = [0, 6, 12, 18, 23].map((col, index) =>
      layout.gridX + col * (layout.cell + layout.gap) + (index === 0 ? 0 : index === 4 ? layout.cell : layout.cell / 2));
    expect(labels.map((call) => call[1])).toEqual(expected);
  });

  it("observes connection, redraws shrink/grow once, ignores equal integer widths, and disconnects/reconnects", () => {
    const observers: Array<{ notify: () => void; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }> = [];
    vi.stubGlobal("ResizeObserver", class {
      observe = vi.fn(); disconnect = vi.fn();
      constructor(notify: () => void) { observers.push({ notify, observe: this.observe, disconnect: this.disconnect }); }
    });
    vi.spyOn(LitElement.prototype, "connectedCallback").mockImplementation(() => {});
    vi.spyOn(LitElement.prototype, "disconnectedCallback").mockImplementation(() => {});
    const card = cardFixture();
    card.hass = undefined; // Keep this test independent of data loading.
    const state = inside(card);
    const { wrap } = canvasFixture(card);
    const draw = vi.spyOn(state, "_drawHeatmap");
    card.connectedCallback();
    expect(observers).toHaveLength(1);
    expect(observers[0]!.observe).toHaveBeenCalledWith(card);
    observers[0]!.notify();
    expect(draw).not.toHaveBeenCalled(); // No layout yet.
    state._drawHeatmap();
    wrap.clientWidth = 360;
    observers[0]!.notify();
    expect(state._renderLayout?.width).toBe(360);
    expect(draw).toHaveBeenCalledTimes(2);
    observers[0]!.notify();
    wrap.clientWidth = 360.9;
    observers[0]!.notify();
    expect(draw).toHaveBeenCalledTimes(2);
    wrap.clientWidth = 900;
    observers[0]!.notify();
    expect(state._renderLayout?.width).toBe(900);
    expect(draw).toHaveBeenCalledTimes(3);
    card.disconnectedCallback();
    expect(observers[0]!.disconnect).toHaveBeenCalledTimes(1);
    card.connectedCallback();
    expect(observers).toHaveLength(2);
    expect(observers[1]!.observe).toHaveBeenCalledWith(card);
    card.disconnectedCallback();
  });

  it("gracefully connects without ResizeObserver", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    vi.spyOn(LitElement.prototype, "connectedCallback").mockImplementation(() => {});
    vi.spyOn(LitElement.prototype, "disconnectedCallback").mockImplementation(() => {});
    const card = cardFixture();
    card.hass = undefined;
    expect(() => card.connectedCallback()).not.toThrow();
    expect(() => card.disconnectedCallback()).not.toThrow();
  });

  it.each([0.5, 1, 2])("keeps hit testing accurate at CSS scale %s before redraw", (factor) => {
    const card = cardFixture();
    canvasFixture(card);
    const state = inside(card);
    state._drawHeatmap();
    const layout = state._renderLayout!;
    const logicalX = layout.gridX + 20 * (layout.cell + layout.gap) + layout.cell / 2;
    const logicalY = layout.gridY + layout.cell / 2;
    state._handleCanvasMove({
      currentTarget: { getBoundingClientRect: () => ({ left: 10, top: 20, width: layout.width * factor, height: layout.height * factor }) },
      clientX: 10 + logicalX * factor, clientY: 20 + logicalY * factor,
    } as unknown as MouseEvent);
    expect(state._tooltip?.bucket).toBe(state._buckets[20]);
    expect(state._tooltip?.x).toBe(Math.min(logicalX * factor + 12, layout.width * factor - 160));
  });
});
