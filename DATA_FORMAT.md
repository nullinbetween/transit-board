# Data format `transit-board/v1`

[繁體中文 → DATA_FORMAT.zh-TW.md](DATA_FORMAT.zh-TW.md)

The board reads one data format. Whatever your source is — an official GTFS feed, an operator's web page, a CSV or a
live API — convert it to this format first, then give it to the board.
This project ships no real timetable; the conversion is yours to do (or hand it to an AI coding assistant — see
*Tutorial C* in the README).

There are two ways to give the board its data:

1. Set `window.TRANSIT_DATA = {...}` in `config.local.js` (or another `*.local.js` file of yours).
2. Write a `loadData()` in `config.local.js` that returns an object in this format. The board calls it again every
   `refresh_sec` seconds — but never while the previous call is still running, so a slow source is waited for rather
   than cut off. If `loadData()` fails or returns nothing, the previous data stays on screen with an error banner.

## Top-level fields

| Field | Required | Meaning |
|---|---|---|
| `format` | ✅ | always `"transit-board/v1"` |
| `dataset_id` | recommended | an id for the dataset. `"demo-fictional"` is reserved for the bundled demo |
| `is_demo` | ✅ | **only an explicit `false` makes the data count as real.** Missing, the string `"false"` or `true` all mean demo |
| `kind` | ✅ | `"static"` (a timetable) or `"realtime"` (predicted arrivals) |
| `timezone` | recommended | IANA time zone, e.g. `"Asia/Tokyo"`, `"Europe/London"`. Without it the device's time zone is used, and the board says so |
| `source` | recommended | where the data came from (shown under Settings) |
| `attribution` | if the source requires it | array of strings; fill it whenever your source's licence asks for credit |
| `links` | optional | `[{label, url}]`; only `http(s)` links are shown |
| `service_day_end_hour` | optional | the hour a service day ends, default `4` (see *After midnight* below) |
| `generated` | optional | the date the data was produced, `YYYY-MM-DD` |

### Only for `kind: "static"`

| Field | Required | Meaning |
|---|---|---|
| `valid_until` | ✅ | last day the timetable is valid, `YYYY-MM-DD`; must be a date that exists. Runs from later days are never shown; after it, a red warning is shown and no departures |
| `calendar.holidays` | recommended | `{"YYYY-MM-DD": "name"}`. Without a list, public holidays are treated as normal days (the board says so) |
| `calendar.holidays_until` | recommended | how far the holiday list reaches (a date that exists, if given). A departure on a later day is shown with “holiday list ends …”; once today is past it, a warning banner is shown instead |
| `calendar.holiday_service` | optional | which column holidays use: `"wd"` / `"sa"` / `"su"`, default `"su"` |

### Only for `kind: "realtime"`

| Field | Required | Meaning |
|---|---|---|
| `fetched_at` | ✅ | when the data was fetched: ISO 8601 **with a UTC offset** (`Z` or `+09:00`); date and time must exist |
| `max_age_sec` | ✅ | after this many seconds the data counts as stale and a warning is shown |

## `stops[]`

| Field | Required | Meaning |
|---|---|---|
| `id` | ✅ | stop id (also used to store the user's own walking time) |
| `label` | ✅ | display name |
| `sub` | optional | subtitle |
| `walk_min` | ✅ | default minutes from your door to the stop, 0–90. Users can change it under Settings; it is stored only in that browser |
| `vehicle` | optional | word used on screen, default `"bus"` |
| `target` | optional | word used on screen, default `"stop"` |
| `lanes` | ✅ | directions / routes at this stop |

Coordinates are neither needed nor recommended.

## `lanes[]`

| Field | Required | Meaning |
|---|---|---|
| `id` | ✅ | direction id |
| `line` | recommended | route name |
| `to` | recommended | destination |
| `services` | required for static | `{wd: [...], sa: [...], su: [...]}`, each entry `{t: "HH:MM", short_to?: "where this run ends early"}` |
| `predictions` | required for realtime | `[{at: "ISO 8601 with offset", short_to?: "..."}]` |

## After midnight

A service day lasts until `service_day_end_hour` (default 4 a.m.). So:

- `00:15` in the Saturday column is the **Saturday-night** run, which leaves at 00:15 on Sunday.
- GTFS-style `24:15` means the same. Times from `00:00` to `47:59` are accepted.

The board looks from yesterday's column up to eight service days ahead, so at any moment it answers “how many minutes
until the next one” and never says “no more today” — a weekday-only route on a Saturday shows Monday's first run.

## Static timetables vs live data

| | Static (`static`) | Live (`realtime`) |
|---|---|---|
| What it is | the operator's published timetable | predicted arrivals at one moment |
| Goes stale when | the timetable changes (`valid_until`) or the holiday list runs out | within minutes (`max_age_sec`) |
| Shown as | `Scheduled` | `Live estimate` |
| Delays | not reflected | reflected, but predictions change |

## Validation

Data is validated when it is loaded. If validation fails, **no departures are shown**, only the list of problems.
Dates and timestamps are checked against the real calendar: `2027-99-99`, `2026-02-30` or an offset of `+25:00` are rejected.
Types are checked too: text fields must be strings, `calendar` and `services` objects, `stops`, `lanes`, `links` and
`attribution` arrays, holiday keys real dates.
`tests/core.test.html` shows the error cases.

## Example adapters

- `adapters/simple-csv-adapter.js`: CSV → this format (sample: `examples/sample-timetable.csv`)
- `adapters/realtime-json-adapter.js`: live JSON → this format (sample: `examples/sample-realtime.json`)

Both only convert; neither goes online by itself. Their output is `is_demo: true` unless you pass `is_demo: false` explicitly.
