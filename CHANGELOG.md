# Changelog

## 0.1.4

- Kept native 5-minute buckets while fixing their axis ticks, row-start labels, and minute-precision tooltips. (#19, #29)
- Parsed exact `YYYY-MM-DD` range boundaries at local midnight instead of UTC midnight. (#29)
- Matched hourly height estimates to rendered local calendar-day rows, including rolling windows and 25-hour DST fallback days. (#36)
- Preserved useful statistics failure and missing-data details when `provider: auto` falls back to raw history. (#26)
- Prevented very large fixed scale bounds from collapsing to a zero-width color range. (#37)
- Updated the development build toolchain to Vite 8.0.16. Card data and configuration formats are unchanged.

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
