# Changelog

## 0.1.4

- Fixed raw-history requests so `provider: history` and automatic history fallback send filters in the GET query string instead of a rejected request body. (#16, PR #21)
- Validated zero-length, reversed, and unparseable ranges during config normalization so Home Assistant can render its normal configuration error. (#18, PR #22)
- Reused number formatters and resolved cell fill colors during drawing to reduce redraw work when tile values are visible. (#20, PR #23)
- Preserved negative values when zero is ignored, including signed series that also contain zero. (#24, PR #30)
- Kept day-aligned `range.hours` windows anchored to local midnight across daylight-saving transitions. (#25, PR #31)
- Preserved every elapsed hourly bucket across daylight-saving transitions, kept each local day on its own row, and distinguished both repeated fallback hours. (#15, PR #32)
- Inferred presets from the active entity and resolved per-entity presets without leaking card-level units, bounds, or stops. (#17, #27, PR #34)
- Kept fixed scale bounds ascending when one or both configured bounds fall outside the observed data. (#28, PR #34)
- Preserved all 5-minute buckets across daylight-saving fallback. (#35, PR #38)
- Kept native 5-minute buckets while fixing their axis ticks, row-start labels, and minute-precision tooltips. (#19, #29, PR #41)
- Parsed exact `YYYY-MM-DD` range boundaries at local midnight instead of UTC midnight. (#29, PR #41)
- Matched hourly height estimates to rendered local calendar-day rows, including rolling windows and 25-hour daylight-saving fallback days. (#36, PR #41)
- Preserved useful statistics failure and missing-data details when `provider: auto` falls back to raw history. (#26, PR #42)
- Prevented very large fixed scale bounds from collapsing to a zero-width color range. (#37, PR #39)
- Updated the development build toolchain to Vite 8.0.16. Card data and configuration formats are unchanged. (PR #40)
- Updated CI actions and development dependencies, isolated main-push concurrency, and stabilized the history aggregation test fixture. (PRs #9, #10, #12, #13, #14, #33, and #43)

## 0.1.3

- Made tile value labels degrade to compact whole-number labels on narrower cards instead of disappearing while the `123` toggle is active.

## 0.1.2

- Added optional per-cell value labels with `tiles.show_values`.
- Added visual editor controls for tile values, including an optional on-card `123` toggle button.
- Reserved larger cells when labels are enabled or when the on-card value toggle is available.

## 0.1.1

- Added visual editor controls for per-entity display aliases.
- Added clearer labels and helper text for scale preset, fixed min/max, display unit, sensitivity, and outlier clipping.

## 0.1.0

- Initial public release candidate.
- Numeric single-entity and multi-entity heatmaps for Home Assistant recorder statistics.
- Short raw-history fallback with caps and warnings.
- Canvas renderer with axes, legend, summary labels, tooltip, keyboard more-info, and first-pass accessibility affordances.
- Fixed-day and rolling time ranges, observed-window auto-scaling, sensitivity tuning, and outlier clipping.
- Lazy loading, duplicate in-flight request suppression, shared request queue, and configurable refresh interval for dashboard safety.
- Home Assistant sections grid sizing support and a graphical editor for common card setup.
