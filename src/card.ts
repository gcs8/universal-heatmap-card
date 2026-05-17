import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { normalizeConfig } from "./config";
import { fetchHeatmapBuckets } from "./data/provider";
import { heatmapRequestQueueState, scheduleHeatmapRequest } from "./data/request-queue";
import { debugLog, debugNow, isDebugEnabled, roundMs } from "./debug";
import {
  buildEditorFormConfig,
  editorEntityIds,
  mergeEditorEntities,
  updateEditorEntityName,
} from "./editor-form";
import {
  estimateCardChromeHeight,
  estimateMasonryCardSize,
  estimateSectionGridRows,
  sectionSpanHeight,
  SECTION_DEFAULT_COLUMNS,
  SECTION_MIN_COLUMNS,
  SECTION_MIN_ROWS,
} from "./layout";
import { buildScale, colorForValue, formatValue, legendGradient } from "./scale";
import {
  CARD_NAME,
  CARD_TAG,
  CARD_VERSION,
  type BucketValue,
  type HassEntity,
  type HeatmapCardConfig,
  type HeatmapRenderLayout,
  type HomeAssistant,
  type NormalizedConfig,
  type ProviderResult,
  type ScaleModel,
  type TooltipState,
} from "./types";

const EDITOR_TAG = `${CARD_TAG}-editor`;

interface CachedSeries {
  result: ProviderResult;
  scale: ScaleModel;
  loadedAt: number;
}

class StaleHeatmapLoadError extends Error {
  constructor() {
    super("Stale heatmap load skipped.");
  }
}

export class UniversalHeatmapCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _activeIndex: { state: true },
    _buckets: { state: true },
    _error: { state: true },
    _loading: { state: true },
    _normalized: { state: true },
    _tooltip: { state: true },
    _warning: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: HeatmapCardConfig;
  private _normalized?: NormalizedConfig;
  private _activeIndex = 0;
  private _buckets: BucketValue[] = [];
  private _scale?: ScaleModel;
  private _loading = false;
  private _error?: string;
  private _warning?: string;
  private _tooltip?: TooltipState;
  private _cache = new Map<string, CachedSeries>();
  private _debug = false;
  private _deferredLoadPending = false;
  private _inFlightKey?: string;
  private _visibleForLoad = typeof globalThis.IntersectionObserver === "undefined";
  private _visibilityObserver?: IntersectionObserver;
  private _loadSeq = 0;
  private _renderLayout?: HeatmapRenderLayout;

  setConfig(config: HeatmapCardConfig): void {
    const previousEntity = this._normalized?.entities[this._activeIndex]?.entity;
    this._config = config;
    this._debug = isDebugEnabled(config);
    this._cache.clear();
    this._inFlightKey = undefined;
    this._loadSeq += 1;
    this._normalized = normalizeConfig(config, this.hass);
    this._activeIndex = this._resolveActiveIndex(previousEntity);
    this._tooltip = undefined;
    debugLog(this._debug, "config applied", {
      entityCount: this._normalized.entities.length,
      bucket: this._normalized.bucket,
      range: this._normalized.range,
      boundToGrid: this._normalized.layout.bound_to_grid,
      refreshInterval: this._normalized.data.refresh_interval,
      deferUntilVisible: this._normalized.data.defer_until_visible,
      maxConcurrentRequests: this._normalized.data.max_concurrent_requests,
    });
    if (this.hass) {
      this._requestActiveSeriesLoad();
    }
  }

  getCardSize(): number {
    return this._estimatedMasonryRows();
  }

  getGridOptions(): Record<string, number> {
    const explicitRows = this._config?.grid_options?.rows;
    const explicitColumns = this._config?.grid_options?.columns;
    const rows =
      typeof explicitRows === "number" && Number.isFinite(explicitRows)
        ? Math.max(1, explicitRows)
        : this._estimatedGridRows();
    const columns =
      typeof explicitColumns === "number" && Number.isFinite(explicitColumns)
        ? Math.max(1, explicitColumns)
        : SECTION_DEFAULT_COLUMNS;
    const explicitMinRows = this._config?.grid_options?.min_rows;
    const explicitMinColumns = this._config?.grid_options?.min_columns;

    return {
      rows,
      columns,
      min_rows:
        typeof explicitMinRows === "number" && Number.isFinite(explicitMinRows)
          ? Math.min(explicitMinRows, rows)
          : Math.min(SECTION_MIN_ROWS, rows),
      min_columns:
        typeof explicitMinColumns === "number" && Number.isFinite(explicitMinColumns)
          ? Math.min(explicitMinColumns, columns)
          : Math.min(SECTION_MIN_COLUMNS, columns),
    };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._setupVisibilityObserver();
    this._requestActiveSeriesLoad();
  }

  override disconnectedCallback(): void {
    this._visibilityObserver?.disconnect();
    this._visibilityObserver = undefined;
    super.disconnectedCallback();
  }

  static getStubConfig(): HeatmapCardConfig {
    return {
      entity: "sensor.example_temperature",
      range: { days: 30 },
      bucket: { interval: "day", value: "mean" },
      scale: { preset: "temperature" },
    };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(EDITOR_TAG);
  }

  static getConfigForm(): Record<string, unknown> {
    return buildEditorFormConfig();
  }

  protected override updated(changed: PropertyValues): void {
    if (
      this._config &&
      (changed.has("hass") || changed.has("_activeIndex"))
    ) {
      this._normalized = normalizeConfig(this._config, this.hass);
      this._requestActiveSeriesLoad();
    }

    if (
      changed.has("_buckets") ||
      changed.has("_loading") ||
      changed.has("_warning")
    ) {
      void this.updateComplete.then(() => this._drawHeatmap());
    }
  }

  protected override render() {
    if (!this._normalized) {
      return html`<ha-card><div class="empty">Configure ${CARD_NAME}</div></ha-card>`;
    }

    const activeEntity = this._normalized.entities[this._activeIndex];
    const stateObj = activeEntity ? this.hass?.states[activeEntity.entity] : undefined;
    const title = this._normalized.title ?? activeEntity?.name ?? CARD_NAME;
    const cardClass = this._shouldBoundToGrid() ? "grid-bound" : "";

    return html`
      <ha-card class=${cardClass}>
        <div class="header">
          <div>
            <div class="title">${title}</div>
            ${activeEntity
              ? html`<div class="subtitle">${activeEntity.entity}</div>`
              : nothing}
          </div>
          ${stateObj
            ? html`<div class="state-chip">${this._formatEntityState(stateObj)}</div>`
            : nothing}
        </div>

        ${this._renderNavigation()}

        <div class="body">
          ${this._loading
            ? html`<div class="status" role="status">Loading heatmap...</div>`
            : nothing}
          ${this._error
            ? html`<div class="status error" role="alert" title=${this._error}>${this._error}</div>`
            : nothing}
          ${this._warning
            ? html`<div class="status warning" role="status" title=${this._warning}>${this._warning}</div>`
            : nothing}
          ${this._normalized.axes.show_key ? this._renderAxisKey() : nothing}
          <div class="canvas-wrap">
            <canvas
              role="img"
              tabindex="0"
              aria-label=${this._heatmapDescription(title)}
              @mousemove=${this._handleCanvasMove}
              @mouseleave=${this._clearTooltip}
              @keydown=${this._handleCanvasKeyDown}
              @click=${this._handleCanvasClick}
            ></canvas>
            ${this._tooltip && this._normalized.tooltip.show
              ? html`<div
                  class="tooltip"
                  style=${`left:${this._tooltip.x}px;top:${this._tooltip.y}px`}
                >
                  ${this._tooltip.label}
                </div>`
              : nothing}
          </div>
          ${this._renderSummary()}
          ${this._normalized.legend.show && this._scale ? this._renderLegend() : nothing}
        </div>
      </ha-card>
    `;
  }

  private _renderNavigation() {
    const config = this._normalized;
    if (!config || config.entities.length <= 1) {
      return nothing;
    }

    if (config.navigation.mode === "dropdown") {
      return html`
        <div class="nav">
          <select @change=${this._handleSelectChange}>
            ${config.entities.map(
              (entity, index) => html`
                <option value=${index} ?selected=${index === this._activeIndex}>
                  ${entity.name}
                </option>
              `,
            )}
          </select>
        </div>
      `;
    }

    if (config.navigation.mode === "arrows") {
      const active = config.entities[this._activeIndex];
      return html`
        <div class="nav arrows">
          <button type="button" @click=${this._previousEntity} aria-label="Previous entity">
            ‹
          </button>
          <span>${active?.name}</span>
          <button type="button" @click=${this._nextEntity} aria-label="Next entity">›</button>
        </div>
      `;
    }

    if (config.navigation.mode === "dots") {
      return html`
        <div class="nav dots">
          ${config.entities.map(
            (entity, index) => html`
              <button
                type="button"
                class=${index === this._activeIndex ? "active" : ""}
                title=${entity.name}
                aria-label=${entity.name}
                aria-pressed=${index === this._activeIndex ? "true" : "false"}
                @click=${() => this._setActiveIndex(index)}
              ></button>
            `,
          )}
        </div>
      `;
    }

    return html`
      <div class="nav tabs">
        ${config.entities.map(
          (entity, index) => html`
            <button
              type="button"
              class=${index === this._activeIndex ? "active" : ""}
              title=${entity.name}
              aria-pressed=${index === this._activeIndex ? "true" : "false"}
              @click=${() => this._setActiveIndex(index)}
            >
              ${entity.name}
            </button>
          `,
        )}
      </div>
    `;
  }

  private _estimatedGridRows(): number {
    const config = this._normalized;
    if (!config) {
      return 6;
    }

    return estimateSectionGridRows(config, this._layoutState());
  }

  private _estimatedMasonryRows(): number {
    const config = this._normalized;
    if (!config) {
      return 6;
    }

    return estimateMasonryCardSize(config, this._layoutState());
  }

  private _layoutState() {
    return {
      loading: this._loading,
      warning: Boolean(this._warning),
      error: Boolean(this._error),
    };
  }

  private _renderSummary() {
    if (!this._scale || this._buckets.length === 0) {
      return nothing;
    }

    const values = this._buckets
      .map((bucket) => bucket.value)
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

    if (values.length === 0) {
      return html`<div class="summary">No bucket data loaded.</div>`;
    }

    const locale = this.hass?.locale?.language;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = [...this._buckets].reverse().find((bucket) => bucket.value !== null)?.value ?? null;

    return html`
      <div class="summary" aria-live="polite">
        <span>Low ${formatValue(min, this._scale, locale)}</span>
        <span>High ${formatValue(max, this._scale, locale)}</span>
        <span>Latest ${formatValue(latest, this._scale, locale)}</span>
      </div>
    `;
  }

  private _renderAxisKey() {
    const config = this._normalized;
    if (!config) {
      return nothing;
    }

    return html`
      <div class="axis-key" aria-label="Heatmap encoding">
        <span><b>X</b> ${this._xAxisLabel()}</span>
        <span><b>Y</b> ${this._yAxisLabel()}</span>
        <span><b>Color</b> ${this._colorAxisLabel()}</span>
      </div>
    `;
  }

  private _renderLegend() {
    if (!this._scale) {
      return nothing;
    }

    const leftLabel = `${this._scale.clippedLow ? "\u2264 " : ""}${formatValue(
      this._scale.min,
      this._scale,
      this.hass?.locale?.language,
    )}`;
    const rightLabel = `${this._scale.clippedHigh ? "\u2265 " : ""}${formatValue(
      this._scale.max,
      this._scale,
      this.hass?.locale?.language,
    )}`;

    return html`
      <div class="legend">
        <span>${leftLabel}</span>
        <div
          class="legend-bar"
          style=${`background: linear-gradient(90deg, ${legendGradient(this._scale)});`}
        ></div>
        <span>${rightLabel}</span>
      </div>
    `;
  }

  private async _loadActiveSeries(): Promise<void> {
    const config = this._normalized;
    const hass = this.hass;
    const activeEntity = config?.entities[this._activeIndex];
    if (!config || !hass || !activeEntity) {
      return;
    }

    const cacheKey = this._seriesCacheKey(config, activeEntity);
    const cached = this._cache.get(cacheKey);
    if (cached && this._isCacheFresh(cached, config.data.refresh_interval)) {
      debugLog(this._debug, "cache hit", {
        entity: activeEntity.entity,
        source: cached.result.source,
        buckets: cached.result.buckets.length,
        ageMs: Date.now() - cached.loadedAt,
      });
      this._buckets = cached.result.buckets;
      this._scale = cached.scale;
      this._warning = cached.result.warning;
      this._error = undefined;
      this._loading = false;
      return;
    }
    if (this._inFlightKey === cacheKey) {
      debugLog(this._debug, "load already in flight", {
        entity: activeEntity.entity,
        queue: heatmapRequestQueueState(config.data.max_concurrent_requests),
      });
      return;
    }
    if (cached) {
      debugLog(this._debug, "cache stale", {
        entity: activeEntity.entity,
        ageMs: Date.now() - cached.loadedAt,
        refreshInterval: config.data.refresh_interval,
      });
    }

    const seq = ++this._loadSeq;
    this._inFlightKey = cacheKey;
    this._loading = true;
    this._error = undefined;
    this._warning = undefined;
    const loadStart = this._debug ? debugNow() : 0;
    const fetchStart = this._debug ? debugNow() : 0;
    debugLog(this._debug, "load start", {
      entity: activeEntity.entity,
      provider: config.data.provider,
      range: config.range,
      bucket: config.bucket,
    });

    try {
      const result = await scheduleHeatmapRequest(
        async () => {
          if (seq !== this._loadSeq) {
            throw new StaleHeatmapLoadError();
          }
          return fetchHeatmapBuckets(hass, config, activeEntity);
        },
        {
          maxConcurrent: config.data.max_concurrent_requests,
          onQueued: (state) => debugLog(this._debug, "request queued", {
            entity: activeEntity.entity,
            ...state,
          }),
          onStart: (state) => debugLog(this._debug, "request start", {
            entity: activeEntity.entity,
            ...state,
          }),
        },
      );
      if (seq !== this._loadSeq) {
        return;
      }
      const fetchMs = this._debug ? roundMs(debugNow() - fetchStart) : 0;
      const scaleStart = this._debug ? debugNow() : 0;
      const scale = buildScale(result.buckets, {
        ...config.scale,
        ...activeEntity.scale,
      });
      const scaleMs = this._debug ? roundMs(debugNow() - scaleStart) : 0;
      this._cache.set(cacheKey, { result, scale, loadedAt: Date.now() });
      this._buckets = result.buckets;
      this._scale = scale;
      this._warning = result.warning;
      debugLog(this._debug, "load complete", {
        entity: activeEntity.entity,
        source: result.source,
        buckets: result.buckets.length,
        fetchMs,
        scaleMs,
        totalMs: roundMs(debugNow() - loadStart),
        scaleMin: scale.min,
        scaleMax: scale.max,
        warning: result.warning,
      });
    } catch (error) {
      if (error instanceof StaleHeatmapLoadError) {
        debugLog(this._debug, "stale queued load skipped", {
          entity: activeEntity.entity,
        });
        return;
      }
      if (seq !== this._loadSeq) {
        return;
      }
      this._error = error instanceof Error ? error.message : "Could not load heatmap data.";
      this._buckets = [];
      debugLog(this._debug, "load failed", {
        entity: activeEntity.entity,
        totalMs: roundMs(debugNow() - loadStart),
        error: this._error,
      });
    } finally {
      if (this._inFlightKey === cacheKey) {
        this._inFlightKey = undefined;
      }
      if (seq === this._loadSeq) {
        this._loading = false;
      }
    }
  }

  private _requestActiveSeriesLoad(): void {
    if (!this._normalized || !this.hass) {
      return;
    }

    if (this._shouldDeferLoad()) {
      this._deferredLoadPending = true;
      debugLog(this._debug, "load deferred until visible", {
        queue: heatmapRequestQueueState(this._normalized.data.max_concurrent_requests),
      });
      return;
    }

    this._deferredLoadPending = false;
    void this._loadActiveSeries();
  }

  private _shouldDeferLoad(): boolean {
    if (!this._normalized?.data.defer_until_visible) {
      return false;
    }
    if (typeof globalThis.IntersectionObserver === "undefined") {
      return false;
    }
    return !this._visibleForLoad;
  }

  private _setupVisibilityObserver(): void {
    this._visibilityObserver?.disconnect();
    if (typeof globalThis.IntersectionObserver === "undefined") {
      this._visibleForLoad = true;
      return;
    }

    this._visibilityObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0);
        if (visible === this._visibleForLoad) {
          return;
        }

        this._visibleForLoad = visible;
        if (visible && this._deferredLoadPending) {
          this._requestActiveSeriesLoad();
        }
      },
      { rootMargin: "320px 0px" },
    );
    this._visibilityObserver.observe(this);
  }

  private _seriesCacheKey(
    config: NormalizedConfig,
    activeEntity: NormalizedConfig["entities"][number],
  ): string {
    return JSON.stringify({
      entity: activeEntity.entity,
      range: config.range,
      bucket: config.bucket,
      data: {
        provider: config.data.provider,
        max_cells: config.data.max_cells,
        raw_history_hours: config.data.raw_history_hours,
      },
      missing: config.missing.mode,
      scale: { ...config.scale, ...activeEntity.scale },
    });
  }

  private _isCacheFresh(cached: CachedSeries, refreshInterval: number): boolean {
    if (refreshInterval <= 0) {
      return true;
    }
    return Date.now() - cached.loadedAt < refreshInterval * 1000;
  }

  private _drawHeatmap(): void {
    const canvas = this.renderRoot.querySelector("canvas");
    if (!canvas || !this._scale) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const drawStart = this._debug ? debugNow() : 0;

    const canvasWrap = canvas.parentElement;
    const width = Math.max(260, Math.floor(canvasWrap?.clientWidth ?? 320));
    const maxCanvasHeight = this._boundedCanvasHeight();
    const layout = this._calculateLayout(width, maxCanvasHeight);
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(layout.width * ratio);
    canvas.height = Math.floor(layout.height * ratio);
    canvas.style.height = `${layout.height}px`;
    canvas.style.width = `${layout.width}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, layout.width, layout.height);
    this._drawAxes(ctx, layout);

    this._buckets.forEach((bucket, index) => {
      const col = index % layout.cols;
      const row = Math.floor(index / layout.cols);
      const x = layout.gridX + col * (layout.cell + layout.gap);
      const y = layout.gridY + row * (layout.cell + layout.gap);
      ctx.fillStyle = colorForValue(bucket.value, this._scale!);
      ctx.fillRect(x, y, layout.cell, layout.cell);

      if (bucket.quality === "carried") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
        ctx.fillRect(x, y + layout.cell - 3, layout.cell, 3);
      }
    });

    this._renderLayout = layout;
    debugLog(this._debug, "draw complete", {
      buckets: this._buckets.length,
      cols: layout.cols,
      rows: layout.rows,
      cell: layout.cell,
      width: layout.width,
      height: layout.height,
      maxCanvasHeight,
      ms: roundMs(debugNow() - drawStart),
    });
  }

  private _calculateLayout(width: number, maxHeight?: number): HeatmapRenderLayout {
    const interval = this._normalized?.bucket.interval ?? "day";
    const count = Math.max(1, this._buckets.length);
    const cols =
      interval === "hour"
        ? 24
        : interval === "5minute"
          ? 48
          : interval === "day"
            ? 7
            : interval === "month"
              ? 12
              : Math.min(12, Math.ceil(Math.sqrt(count * 1.8)));
    const gap = 3;
    const labelWidth = this._shouldShowRowLabels() ? 58 : 0;
    const labelHeight = this._shouldShowXAxisLabels() ? 18 : 0;
    const gridWidth = Math.max(160, width - labelWidth);
    const rows = Math.ceil(count / cols);
    const minCell = 7;
    let cell = Math.max(minCell, Math.min(22, Math.floor((gridWidth - gap * (cols - 1)) / cols)));
    if (typeof maxHeight === "number") {
      const availableGridHeight = Math.max(0, maxHeight - labelHeight);
      const heightBoundCell = Math.floor((availableGridHeight - Math.max(0, rows - 1) * gap) / rows);
      if (Number.isFinite(heightBoundCell) && heightBoundCell >= minCell) {
        cell = Math.min(cell, heightBoundCell);
      }
    }
    const actualGridWidth = cols * cell + Math.max(0, cols - 1) * gap;
    const gridHeight = rows * cell + Math.max(0, rows - 1) * gap;
    const height = labelHeight + gridHeight;

    return {
      cols,
      rows,
      cell,
      gap,
      width,
      height,
      gridX: labelWidth,
      gridY: labelHeight,
      gridWidth: actualGridWidth,
      gridHeight,
    };
  }

  private _boundedCanvasHeight(): number | undefined {
    if (!this._shouldBoundToGrid()) {
      return undefined;
    }
    const rows = this._config?.grid_options?.rows;
    if (typeof rows !== "number" || !Number.isFinite(rows) || rows <= 0) {
      return undefined;
    }

    const config = this._normalized;
    if (!config) {
      return undefined;
    }

    const budget = sectionSpanHeight(rows) - estimateCardChromeHeight(config, this._layoutState());
    if (budget <= 0) {
      return undefined;
    }
    return Math.max(120, budget);
  }

  private _shouldBoundToGrid(): boolean {
    const mode = this._normalized?.layout.bound_to_grid ?? "auto";
    if (mode === true) {
      return true;
    }
    if (mode === false) {
      return false;
    }

    const rows = this._config?.grid_options?.rows;
    return typeof rows === "number" && Number.isFinite(rows) && rows > 0;
  }

  private _drawAxes(ctx: CanvasRenderingContext2D, layout: HeatmapRenderLayout): void {
    if (!this._normalized?.axes.show) {
      return;
    }

    const style = getComputedStyle(this);
    const textColor = style.getPropertyValue("--secondary-text-color").trim() || "#64748b";
    const gridLine = style.getPropertyValue("--divider-color").trim() || "#d8dee8";

    ctx.save();
    ctx.font = "11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = textColor;
    ctx.strokeStyle = gridLine;
    ctx.lineWidth = 1;

    if (this._normalized.axes.x_labels) {
      for (const tick of this._xAxisTicks(layout)) {
        const x = layout.gridX + tick.col * (layout.cell + layout.gap);
        ctx.textAlign = tick.align;
        ctx.textBaseline = "top";
        ctx.fillText(tick.label, x, 0);
      }
    }

    if (this._shouldShowRowLabels()) {
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let row = 0; row < layout.rows; row += 1) {
        const bucket = this._buckets[row * layout.cols];
        if (!bucket) {
          continue;
        }
        const y = layout.gridY + row * (layout.cell + layout.gap) + layout.cell / 2;
        ctx.fillText(this._rowLabel(bucket.start), layout.gridX - 8, y);
      }

      ctx.beginPath();
      ctx.moveTo(layout.gridX - 3.5, layout.gridY);
      ctx.lineTo(layout.gridX - 3.5, layout.gridY + layout.gridHeight);
      ctx.stroke();
    }

    ctx.restore();
  }

  private _handleCanvasMove(event: MouseEvent): void {
    if (!this._renderLayout || !this._scale || !this._normalized?.tooltip.show) {
      return;
    }
    const canvas = event.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const stride = this._renderLayout.cell + this._renderLayout.gap;
    if (
      x < this._renderLayout.gridX ||
      x > this._renderLayout.gridX + this._renderLayout.gridWidth ||
      y < this._renderLayout.gridY ||
      y > this._renderLayout.gridY + this._renderLayout.gridHeight
    ) {
      this._tooltip = undefined;
      return;
    }
    const col = Math.floor((x - this._renderLayout.gridX) / stride);
    const row = Math.floor((y - this._renderLayout.gridY) / stride);
    const index = row * this._renderLayout.cols + col;
    const bucket = this._buckets[index];

    if (!bucket) {
      this._tooltip = undefined;
      return;
    }

    const label = `${this._formatDate(bucket.start)} - ${this._formatDate(bucket.end)}: ${formatValue(
      bucket.value,
      this._scale,
      this.hass?.locale?.language,
    )}`;
    this._tooltip = {
      x: Math.min(x + 12, rect.width - 160),
      y: Math.max(4, y - 28),
      bucket,
      label,
    };
  }

  private _handleCanvasClick(): void {
    this._openActiveEntityDetails();
  }

  private _handleCanvasKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    this._openActiveEntityDetails();
  }

  private _openActiveEntityDetails(): void {
    const config = this._normalized;
    const activeEntity = config?.entities[this._activeIndex];
    if (!activeEntity) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: activeEntity.entity },
      }),
    );
  }

  private _heatmapDescription(title: string): string {
    return `${title} heatmap. X axis ${this._xAxisLabel()}, Y axis ${this._yAxisLabel()}, color ${this._colorAxisLabel()}. Press Enter to open entity details.`;
  }

  private _clearTooltip(): void {
    this._tooltip = undefined;
  }

  private _setActiveIndex(index: number): void {
    if (!this._normalized || index < 0 || index >= this._normalized.entities.length) {
      return;
    }
    this._activeIndex = index;
  }

  private _resolveActiveIndex(previousEntity: string | undefined): number {
    if (!this._normalized) {
      return 0;
    }
    if (previousEntity) {
      const matchingIndex = this._normalized.entities.findIndex(
        (entity) => entity.entity === previousEntity,
      );
      if (matchingIndex >= 0) {
        return matchingIndex;
      }
      return 0;
    }
    return Math.min(this._activeIndex, Math.max(0, this._normalized.entities.length - 1));
  }

  private _previousEntity(): void {
    if (!this._normalized) {
      return;
    }
    const count = this._normalized.entities.length;
    this._activeIndex = (this._activeIndex + count - 1) % count;
  }

  private _nextEntity(): void {
    if (!this._normalized) {
      return;
    }
    this._activeIndex = (this._activeIndex + 1) % this._normalized.entities.length;
  }

  private _handleSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this._setActiveIndex(Number(select.value));
  }

  private _formatEntityState(stateObj: HassEntity): string {
    if (this.hass?.formatEntityState) {
      return this.hass.formatEntityState(stateObj);
    }
    const unit = stateObj.attributes.unit_of_measurement
      ? ` ${String(stateObj.attributes.unit_of_measurement)}`
      : "";
    return `${stateObj.state}${unit}`;
  }

  private _formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.hass?.locale?.language, {
      month: "short",
      day: "numeric",
      hour: this._normalized?.bucket.interval === "hour" ? "numeric" : undefined,
    }).format(date);
  }

  private _xAxisLabel(): string {
    switch (this._normalized?.bucket.interval) {
      case "5minute":
      case "hour":
        return "time of day";
      case "day":
        return "day of week";
      case "week":
        return "week";
      case "month":
        return "month";
      default:
        return "bucket";
    }
  }

  private _yAxisLabel(): string {
    switch (this._normalized?.bucket.interval) {
      case "5minute":
      case "hour":
        return "date";
      case "day":
        return "week row";
      case "week":
      case "month":
        return "period row";
      default:
        return "row";
    }
  }

  private _colorAxisLabel(): string {
    const value = this._bucketValueLabel(this._normalized?.bucket.value);
    const unit = this._scale?.unit ? ` (${this._scale.unit})` : "";
    return `${value}${unit}`;
  }

  private _bucketValueLabel(value?: string): string {
    switch (value) {
      case "mean":
        return "average value";
      case "max":
        return "peak value";
      case "min":
        return "low value";
      case "last":
      case "state":
        return "last value";
      case "sum":
        return "total";
      case "delta":
      case "change":
        return "change";
      case "count":
        return "sample count";
      case "percent_on":
        return "percent on";
      case "duration_on":
        return "time on";
      default:
        return "bucket value";
    }
  }

  private _shouldShowRowLabels(): boolean {
    return Boolean(
      this._normalized?.axes.show && this._normalized.axes.y_labels && this._buckets.length > 0,
    );
  }

  private _shouldShowXAxisLabels(): boolean {
    return Boolean(
      this._normalized?.axes.show && this._normalized.axes.x_labels && this._buckets.length > 0,
    );
  }

  private _xAxisTicks(layout: HeatmapRenderLayout): Array<{
    col: number;
    label: string;
    align: CanvasTextAlign;
  }> {
    const interval = this._normalized?.bucket.interval;
    if (interval === "hour") {
      return this._timeTicks([0, 6, 12, 18, 23]);
    }
    if (interval === "5minute") {
      return this._timeTicks([0, 12, 24, 36, 47]);
    }
    if (interval === "day") {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, col) => ({
        col,
        label,
        align: "center" as const,
      }));
    }
    if (interval === "month") {
      return ["Jan", "Apr", "Jul", "Oct", "Dec"].map((label, index) => ({
        col: [0, 3, 6, 9, 11][index] ?? 0,
        label,
        align: index === 0 ? ("left" as const) : index === 4 ? ("right" as const) : ("center" as const),
      }));
    }

    const last = Math.max(0, layout.cols - 1);
    return [
      { col: 0, label: "Start", align: "left" },
      { col: last, label: "End", align: "right" },
    ];
  }

  private _timeTicks(cols: number[]): Array<{
    col: number;
    label: string;
    align: CanvasTextAlign;
  }> {
    return cols.map((col, index) => {
      const bucket = this._buckets[col];
      return {
        col,
        label: bucket ? this._formatHour(bucket.start) : String(col),
        align:
          index === 0
            ? ("left" as const)
            : index === cols.length - 1
              ? ("right" as const)
              : ("center" as const),
      };
    });
  }

  private _formatHour(date: Date): string {
    const parts = new Intl.DateTimeFormat(this.hass?.locale?.language, {
      hour: "numeric",
    }).formatToParts(date);
    return parts
      .filter((part) => part.type === "hour" || part.type === "dayPeriod")
      .map((part) => part.value.toLowerCase())
      .join("")
      .replace(/\s/g, "");
  }

  private _rowLabel(date: Date): string {
    const interval = this._normalized?.bucket.interval;
    const options: Intl.DateTimeFormatOptions =
      interval === "month"
        ? { year: "2-digit" }
        : { month: "short", day: "numeric" };
    return new Intl.DateTimeFormat(this.hass?.locale?.language, options).format(date);
  }

  static override styles = css`
    :host {
      box-sizing: border-box;
      display: block;
    }

    ha-card {
      box-sizing: border-box;
      overflow: hidden;
      width: 100%;
    }

    ha-card.grid-bound {
      max-width: 100%;
    }

    .header {
      align-items: flex-start;
      display: flex;
      gap: 12px;
      justify-content: space-between;
      padding: 16px 16px 8px;
    }

    .title {
      color: var(--primary-text-color);
      font-size: 18px;
      font-weight: 600;
      line-height: 1.25;
    }

    .subtitle {
      color: var(--secondary-text-color);
      font-size: 12px;
      line-height: 1.4;
      margin-top: 2px;
    }

    .state-chip {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      color: var(--primary-text-color);
      font-size: 12px;
      line-height: 1;
      padding: 7px 10px;
      white-space: nowrap;
    }

    .nav {
      align-items: center;
      display: flex;
      gap: 8px;
      padding: 0 16px 10px;
    }

    .tabs {
      flex-wrap: wrap;
    }

    button,
    select {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      color: var(--primary-text-color);
      font: inherit;
      min-height: 32px;
    }

    button {
      cursor: pointer;
      padding: 0 10px;
    }

    button.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color);
    }

    .arrows {
      justify-content: space-between;
    }

    .arrows span {
      color: var(--primary-text-color);
      font-weight: 600;
    }

    .dots button {
      border-radius: 50%;
      height: 12px;
      min-height: 12px;
      padding: 0;
      width: 12px;
    }

    .body {
      padding: 0 16px 16px;
    }

    .grid-bound .body {
      overflow: hidden;
    }

    .canvas-wrap {
      min-height: 88px;
      position: relative;
    }

    .grid-bound .canvas-wrap {
      overflow: hidden;
    }

    .axis-key {
      align-items: center;
      color: var(--secondary-text-color);
      display: flex;
      flex-wrap: wrap;
      font-size: 12px;
      gap: 8px 14px;
      margin: 0 0 8px;
    }

    .axis-key b {
      color: var(--primary-text-color);
      font-weight: 700;
      margin-right: 3px;
    }

    canvas {
      display: block;
      max-width: 100%;
    }

    .status {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      box-sizing: border-box;
      color: var(--secondary-text-color);
      font-size: 11px;
      line-height: 1.25;
      margin-bottom: 8px;
      max-width: 100%;
      overflow: hidden;
      padding: 6px 8px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status.warning {
      border-color: var(--warning-color, #f2c14e);
      color: var(--primary-text-color);
    }

    .status.error {
      border-color: var(--error-color, #db4437);
      color: var(--error-color, #db4437);
    }

    .summary {
      color: var(--secondary-text-color);
      display: flex;
      flex-wrap: wrap;
      font-size: 12px;
      gap: 10px;
      justify-content: space-between;
      margin-top: 10px;
    }

    .legend {
      align-items: center;
      color: var(--secondary-text-color);
      display: grid;
      font-size: 12px;
      gap: 8px;
      grid-template-columns: auto 1fr auto;
      margin-top: 12px;
    }

    .legend-bar {
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      height: 9px;
    }

    .tooltip {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.22));
      color: var(--primary-text-color);
      font-size: 12px;
      max-width: 220px;
      padding: 6px 8px;
      pointer-events: none;
      position: absolute;
      z-index: 1;
    }

    .empty {
      color: var(--secondary-text-color);
      padding: 16px;
    }
  `;
}

class UniversalHeatmapCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: HeatmapCardConfig;
  private readonly _form = buildEditorFormConfig();

  setConfig(config: HeatmapCardConfig): void {
    this._config = config;
  }

  protected override render() {
    if (!this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._editorData()}
        .schema=${this._form.schema}
        .computeLabel=${this._form.computeLabel}
        .computeHelper=${this._form.computeHelper}
        @value-changed=${this._handleValueChanged}
      ></ha-form>
      ${this._renderEntityNameEditor()}
    `;
  }

  private _editorData(): Record<string, unknown> {
    const { entity: _entity, ...config } = this._config ?? {};
    return {
      ...config,
      entities: editorEntityIds(this._config ?? {}),
    };
  }

  private _handleValueChanged(event: CustomEvent<{ value?: Record<string, unknown> }>): void {
    if (!this._config) {
      return;
    }

    const value = event.detail.value ?? {};
    const selectedEntities = this._selectedEntities(value.entities);
    const nextConfig: HeatmapCardConfig = {
      ...this._config,
      ...value,
      entities: mergeEditorEntities(this._config, selectedEntities),
    };
    this._applyConfig(nextConfig);
  }

  private _selectedEntities(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((entity): entity is string => typeof entity === "string" && entity.length > 0);
    }
    if (typeof value === "string" && value.length > 0) {
      return [value];
    }
    return editorEntityIds(this._config ?? {});
  }

  private _renderEntityNameEditor() {
    if (!this._config) {
      return nothing;
    }

    const entries = mergeEditorEntities(this._config, editorEntityIds(this._config));
    if (entries.length === 0) {
      return nothing;
    }

    return html`
      <section class="editor-section" aria-label="Entity labels">
        <div class="editor-title">Entity labels</div>
        <div class="editor-helper">
          Optional tab/card labels. Leave blank to use Home Assistant's entity name.
        </div>
        ${entries.map((entry) => {
          const entity = typeof entry === "string" ? entry : entry.entity;
          const alias = typeof entry === "string" ? "" : entry.name ?? "";
          return html`
            <label class="alias-row">
              <span class="alias-copy">
                <span class="alias-entity">${entity}</span>
                <span class="alias-default">${this._defaultEntityName(entity)}</span>
              </span>
              <input
                .value=${alias}
                placeholder="Use Home Assistant name"
                @input=${(event: Event) => this._handleEntityNameInput(entity, event)}
              />
            </label>
          `;
        })}
      </section>
    `;
  }

  private _handleEntityNameInput(entityId: string, event: Event): void {
    if (!this._config) {
      return;
    }

    const input = event.target as HTMLInputElement;
    this._applyConfig(updateEditorEntityName(this._config, entityId, input.value));
  }

  private _defaultEntityName(entityId: string): string {
    const stateObj = this.hass?.states[entityId];
    if (stateObj && this.hass?.formatEntityName) {
      return this.hass.formatEntityName(stateObj);
    }
    if (stateObj?.attributes.friendly_name) {
      return String(stateObj.attributes.friendly_name);
    }
    return entityId;
  }

  private _applyConfig(nextConfig: HeatmapCardConfig): void {
    delete nextConfig.entity;
    this._config = nextConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: true,
        composed: true,
        detail: { config: nextConfig },
      }),
    );
  }

  static override styles = css`
    .editor-section {
      border-top: 1px solid var(--divider-color);
      margin-top: 16px;
      padding-top: 16px;
    }

    .editor-title {
      color: var(--primary-text-color);
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .editor-helper {
      color: var(--secondary-text-color);
      font-size: 12px;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .alias-row {
      align-items: center;
      display: grid;
      gap: 10px;
      grid-template-columns: minmax(0, 1fr) minmax(140px, 220px);
      margin: 0 0 10px;
    }

    .alias-copy {
      min-width: 0;
    }

    .alias-entity,
    .alias-default {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .alias-entity {
      color: var(--primary-text-color);
      font-size: 13px;
    }

    .alias-default {
      color: var(--secondary-text-color);
      font-size: 12px;
      margin-top: 2px;
    }

    input {
      background: var(--input-fill-color, var(--secondary-background-color));
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      box-sizing: border-box;
      color: var(--primary-text-color);
      font: inherit;
      min-height: 40px;
      padding: 8px 10px;
      width: 100%;
    }

    input::placeholder {
      color: var(--secondary-text-color);
    }

    input:focus {
      border-color: var(--primary-color);
      outline: none;
    }

    @media (max-width: 640px) {
      .alias-row {
        grid-template-columns: 1fr;
      }
    }
  `;
}

if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, UniversalHeatmapCard);
}

if (!customElements.get(EDITOR_TAG)) {
  customElements.define(EDITOR_TAG, UniversalHeatmapCardEditor);
}

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: CARD_TAG,
  name: CARD_NAME,
  preview: true,
  description: "Canvas heatmaps for Home Assistant recorder statistics and short history ranges.",
  documentationURL: "https://github.com/gcs8/universal-heatmap-card",
});

console.info(
  `%c${CARD_NAME}%c ${CARD_VERSION}`,
  "color: #3a6ea5; font-weight: 700;",
  "color: inherit;",
);
