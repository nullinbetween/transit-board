/* ==========================================================================
   simple-csv-adapter.js — convert a flat CSV timetable into transit-board/v1.

   This only converts text you already have. It does not fetch anything.

   Expected header (one row per departure):
     stop_id,stop_label,walk_min,lane_id,line,to,day_type,time,short_to

   day_type : wd | sa | su   (weekday / Saturday / Sunday & holidays)
   time     : HH:MM; 00:00–03:59 or 24:00–47:59 mean "after midnight" of that
              service day (see DATA_FORMAT.md)
   short_to : optional; set when that run stops short of the lane's destination

   meta (second argument) supplies the dataset fields that a CSV cannot hold.
   is_demo stays true unless meta.is_demo === false is given explicitly.
   ========================================================================== */
(function (root) {
  'use strict';

  // Minimal RFC 4180 parser: quoted fields, doubled quotes, CRLF/LF.
  function parseCsv(text) {
    const rows = [];
    let row = [], field = '', i = 0, q = false;
    const s = String(text).replace(/^﻿/, '');
    while (i < s.length) {
      const c = s[i];
      if (q) {
        if (c === '"') {
          if (s[i + 1] === '"') { field += '"'; i += 2; continue; }
          q = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"') { q = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += c; i++;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows.filter(r => r.some(v => v.trim() !== ''));
  }

  const REQUIRED = ['stop_id', 'stop_label', 'walk_min', 'lane_id', 'line', 'to', 'day_type', 'time'];

  function fromSimpleCsv(csvText, meta) {
    meta = meta || {};
    const rows = parseCsv(csvText);
    if (!rows.length) throw new Error('CSV is empty.');
    const header = rows[0].map(h => h.trim());
    const col = {};
    header.forEach((h, i) => { col[h] = i; });
    const missing = REQUIRED.filter(h => !(h in col));
    if (missing.length) throw new Error('CSV is missing columns: ' + missing.join(', '));

    const stops = new Map();
    rows.slice(1).forEach((r, n) => {
      const get = k => (col[k] === undefined ? '' : String(r[col[k]] || '').trim());
      const line = n + 2;
      const dayType = get('day_type');
      if (!['wd', 'sa', 'su'].includes(dayType)) throw new Error(`Row ${line}: day_type must be wd, sa or su.`);
      const time = get('time');
      if (!/^\d{2}:[0-5]\d$/.test(time) || +time.slice(0, 2) > 47) throw new Error(`Row ${line}: time must be HH:MM (00:00–47:59).`);
      const walk = Number(get('walk_min'));
      if (!Number.isFinite(walk)) throw new Error(`Row ${line}: walk_min must be a number.`);

      const stopId = get('stop_id');
      if (!stops.has(stopId)) {
        stops.set(stopId, { id: stopId, label: get('stop_label'), sub: '', walk_min: walk, lanes: new Map() });
      }
      const stop = stops.get(stopId);
      const laneId = get('lane_id');
      if (!stop.lanes.has(laneId)) {
        stop.lanes.set(laneId, { id: laneId, line: get('line'), to: get('to'), services: { wd: [], sa: [], su: [] } });
      }
      const dep = { t: time };
      const shortTo = get('short_to');
      if (shortTo) dep.short_to = shortTo;
      stop.lanes.get(laneId).services[dayType].push(dep);
    });

    return {
      format: 'transit-board/v1',
      dataset_id: meta.dataset_id || 'csv-import',
      is_demo: meta.is_demo === false ? false : true,
      kind: 'static',
      source: meta.source || 'CSV import',
      generated: meta.generated || null,
      valid_until: meta.valid_until || null,
      timezone: meta.timezone || null,
      service_day_end_hour: meta.service_day_end_hour == null ? 4 : meta.service_day_end_hour,
      calendar: meta.calendar || {},
      attribution: meta.attribution || [],
      links: meta.links || [],
      stops: [...stops.values()].map(s => ({ ...s, lanes: [...s.lanes.values()] }))
    };
  }

  root.TransitAdapters = Object.assign(root.TransitAdapters || {}, { parseCsv, fromSimpleCsv });
})(typeof window !== 'undefined' ? window : globalThis);
