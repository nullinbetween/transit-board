/* ==========================================================================
   realtime-json-adapter.js — map a realtime arrivals response into
   transit-board/v1 (kind: "realtime").

   This only converts an object you already fetched. It does not fetch.
   Real APIs all differ; treat this as a template and change the field
   names in pick() to match yours.

   Input shape assumed by this template:
   {
     "fetched_at": "2026-10-21T08:00:00+09:00",
     "stops": [
       { "id": "s1", "name": "Stop name", "walk_min": 5,
         "arrivals": [
           { "route": "12", "destination": "Somewhere",
             "expected": "2026-10-21T08:07:00+09:00", "short_to": null }
         ] }
     ]
   }

   is_demo stays true unless meta.is_demo === false is given explicitly.
   ========================================================================== */
(function (root) {
  'use strict';

  const pick = {
    fetchedAt: r => r.fetched_at,
    stops: r => r.stops || [],
    stopId: s => String(s.id),
    stopLabel: s => String(s.name || s.id),
    walkMin: s => Number(s.walk_min),
    arrivals: s => s.arrivals || [],
    route: a => String(a.route || ''),
    destination: a => String(a.destination || ''),
    expected: a => a.expected,
    shortTo: a => a.short_to || null
  };

  function fromRealtimeJson(resp, meta) {
    meta = meta || {};
    if (!resp || typeof resp !== 'object') throw new Error('Realtime response is not an object.');
    const stops = pick.stops(resp).map(s => {
      const lanes = new Map();
      for (const a of pick.arrivals(s)) {
        const key = pick.route(a) + '>' + pick.destination(a);
        if (!lanes.has(key)) {
          lanes.set(key, { id: key, line: pick.route(a), to: pick.destination(a), predictions: [] });
        }
        const p = { at: pick.expected(a) };
        const st = pick.shortTo(a);
        if (st) p.short_to = st;
        lanes.get(key).predictions.push(p);
      }
      const walk = pick.walkMin(s);
      return {
        id: pick.stopId(s),
        label: pick.stopLabel(s),
        sub: '',
        walk_min: Number.isFinite(walk) ? walk : (meta.default_walk_min == null ? 5 : meta.default_walk_min),
        lanes: [...lanes.values()]
      };
    });
    return {
      format: 'transit-board/v1',
      dataset_id: meta.dataset_id || 'realtime-import',
      is_demo: meta.is_demo === false ? false : true,
      kind: 'realtime',
      source: meta.source || 'Realtime import',
      fetched_at: pick.fetchedAt(resp),
      max_age_sec: meta.max_age_sec == null ? 120 : meta.max_age_sec,
      timezone: meta.timezone || null,
      calendar: {},
      attribution: meta.attribution || [],
      links: meta.links || [],
      stops
    };
  }

  root.TransitAdapters = Object.assign(root.TransitAdapters || {}, { fromRealtimeJson });
})(typeof window !== 'undefined' ? window : globalThis);
