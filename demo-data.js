/* ==========================================================================
   demo-data.js — FICTIONAL demo data for transit-board.html

   Every stop, route, destination, time and holiday below is invented.
   None of it describes a real place or a real timetable. There are no
   coordinates on purpose.

   is_demo is true and dataset_id is "demo-fictional". The board keeps the
   DEMO banner on screen for this dataset even if someone edits is_demo, so
   the demo can never silently pass as a real timetable.

   Format: transit-board/v1 — see DATA_FORMAT.md.
   ========================================================================== */
(function () {
  // Build "HH:MM" lists from a simple headway pattern so the demo stays short.
  function every(startH, startM, endH, endM, stepMin) {
    const out = [];
    for (let m = startH * 60 + startM; m <= endH * 60 + endM; m += stepMin) {
      out.push({ t: String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') });
    }
    return out;
  }
  // Mark every third departure as a short-turn that only goes part of the way.
  function withShortTurns(list, shortTo) {
    return list.map((x, i) => (i % 3 === 2 ? { t: x.t, short_to: shortTo } : x));
  }

  window.TRANSIT_DATA = {
    format: 'transit-board/v1',
    dataset_id: 'demo-fictional',
    is_demo: true,
    kind: 'static',
    source: 'Fictional demo data bundled with transit-board (not a real timetable)',
    generated: '2026-10-21',
    valid_until: '2099-12-31',
    // No timezone: the demo follows the device's own time zone.
    service_day_end_hour: 4,
    calendar: {
      holiday_service: 'su',
      holidays_until: '2099-12-31',
      holidays: {
        '2026-11-18': 'Demo Holiday (fictional)',
        '2026-12-16': 'Demo Holiday (fictional)',
        '2027-01-20': 'Demo Holiday (fictional)'
      }
    },
    attribution: ['Demo data: invented for illustration, no external source.'],
    links: [],
    stops: [
      {
        id: 'lantern-sq',
        label: 'Lantern Square',
        sub: 'Demo bus stop',
        walk_min: 6,
        vehicle: 'bus',
        target: 'stop',
        lanes: [
          {
            id: 'r12-north',
            line: 'Route 12 (demo)',
            to: 'Kestrel Bridge',
            services: {
              wd: withShortTurns(every(5, 40, 23, 40, 12), 'Orchard Loop'),
              // Saturday column ends with two after-midnight runs (00:15, 00:45 = Saturday night).
              sa: every(6, 10, 23, 10, 20).concat([{ t: '00:15' }, { t: '00:45' }]),
              su: every(6, 30, 22, 30, 30)
            }
          },
          {
            id: 'r12-south',
            line: 'Route 12 (demo)',
            to: 'Harbor Terminal',
            services: {
              wd: every(5, 50, 23, 50, 15),
              sa: every(6, 20, 23, 20, 20),
              su: every(6, 40, 22, 40, 30)
            }
          }
        ]
      },
      {
        id: 'quill-ave',
        label: 'Quill Avenue',
        sub: 'Demo tram stop',
        walk_min: 9,
        vehicle: 'tram',
        target: 'platform',
        lanes: [
          {
            id: 'line-a-east',
            line: 'Line A (demo)',
            to: 'Central (demo)',
            services: {
              wd: every(5, 30, 24, 30, 10),   // GTFS-style 24:xx = after midnight
              sa: every(6, 0, 24, 0, 15),
              su: every(6, 30, 23, 30, 20)
            }
          }
        ]
      }
    ]
  };
})();
