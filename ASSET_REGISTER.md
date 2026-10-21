# Asset register — transit-board

Last updated: 2026-10-21

## Third-party code

None. The board is one HTML file with plain JavaScript; no external library, CDN or web font is loaded.

## Data

| # | Material | Used for | Source | Licence | Commercial use | Credit needed |
|---|---|---|---|---|---|---|
| 1 | `demo-data.js` stops, routes, times and holidays | demo | invented for this project | MIT (this project) | ✅ | no\* |
| 2 | `examples/*.csv`, `examples/*.json` | adapter examples | invented for this project | MIT (this project) | ✅ | no\* |

\* No credit line is needed to use these, but copies you redistribute must keep this project's MIT copyright and licence notice (`LICENSE`).

This package contains **no** real timetable, real stop, coordinates, weather data, official holiday data or calendar.

## Fonts

None bundled or loaded. Only system fonts named in CSS `font-family` lists are used.

## Icons

| # | Material | Source | Note |
|---|---|---|---|
| 1 | tab icon (white arrow on black, inline SVG data URI) | this project's own SVG | the arrow is the Unicode character U+2192 drawn with a system font |

## External sources removed before release

Removed from the board during preparation; this package no longer uses them and needs no credit for them:

- a weather API (previously called automatically on start)
- an official holiday list (previously hard-coded in the HTML)
- real transit data and its credit line (kept in a separate file that was not copied into this package)
- a private calendar integration

## Data you add yourself

The licence and credit requirements of any data you load through `config.local.js` are yours to check; put required
credit lines in the data's `attribution` field.

## Audit log

| Date | Checked | Result |
|---|---|---|
| 2026-10-21 | network requests made by the board | tested locally: only `.js` files from the same folder; no external requests |
