# Known limitations — transit-board

## Limitations

1. **Daylight saving time (DST)**: times are computed as minutes after local midnight, assuming 24-hour days. On the day
   the clocks change, runs that cross the change can be off by one hour.
2. **Holiday rules**: only “holidays use a given column” (`holiday_service`) is supported — not one-off extra or
   cancelled services on specific dates.
3. **Search window**: departures are looked up from yesterday's column to eight service days ahead, and never past
   `valid_until`. A route with no run in that window shows “No departures”; an expired timetable shows none at all.
4. **Live data**: the board never fetches by itself; it only calls the `loadData()` you write in `config.local.js`,
   one call at a time — a source slower than `refresh_sec` is waited for, so the screen updates less often.
   `realtime-json-adapter.js` is a template — rename its fields to match your API.
5. **Opening by double-click (`file://`)**: when `config.local.js` does not exist, the browser console shows one loading
   error (harmless). `fetch()` in option B usually does not work on `file://`.
6. **Walking times** live in localStorage: private browsing or clearing site data resets them.
7. **English interface only.**

## Test coverage

`tests/core.test.html` has 55 tests, mostly for the pure core functions and the adapters (including the `valid_until`
cutoff, runs past `holidays_until` and wrong JSON types), plus two UI checks that drive the real board in an iframe: the bundled demo is marked
DEMO; invalid data shows no departures; explicit `is_demo: false` data is not marked demo; only one `loadData()` runs at
a time and a slow answer is still applied; a `loadData()` that returns nothing keeps the previous data with an error
banner.

Checked by hand once, not automated:

- how the stale-live-data warning looks
- HTML in data being escaped and `javascript:` links being dropped on screen (the escaping functions themselves are tested)

Safari, Firefox and phones: **not tested**.
