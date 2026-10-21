/* ==========================================================================
   config.example.js — copy this file to config.local.js and edit the copy.

   Not plug-and-play: this project ships no real timetable. Until you load
   your own data marked is_demo:false, the board keeps showing the DEMO
   warning — set it to false only after checking that the times are real.
   See README.md ("Tutorial") and DATA_FORMAT.md.

   config.local.js is loaded by transit-board.html if it exists and is listed
   in .gitignore, so your own settings, data URLs and any API key stay out of
   the repository. Nothing in this example is active until you copy it.

   The board never contacts a transit API, weather service or calendar by
   itself. Any network access happens only inside a loadData() you write.
   ========================================================================== */
window.TRANSIT_CONFIG = {
  // Shown in the browser tab.
  title: 'Departures',

  // How often loadData() is called again, in seconds (minimum 15).
  refresh_sec: 60,

  // ---- Option A: your own static timetable ---------------------------------
  // Put a file such as my-timetable.local.js next to the board that sets
  //   window.TRANSIT_DATA = { format: 'transit-board/v1', is_demo: false, ... }
  // and add <script src="my-timetable.local.js"></script> after config.local.js,
  // or assign window.TRANSIT_DATA directly at the bottom of this file.
  // See DATA_FORMAT.md. Leave loadData as null for this option.

  // ---- Option B: fetch and convert your own source --------------------------
  // Return data in the transit-board/v1 format. Examples (all disabled):
  //
  // loadData: async function () {
  //   // Static CSV you host yourself (see adapters/simple-csv-adapter.js):
  //   const csv = await (await fetch('my-timetable.csv')).text();
  //   return TransitAdapters.fromSimpleCsv(csv, {
  //     is_demo: false,
  //     dataset_id: 'my-timetable',
  //     timezone: 'Europe/London',
  //     valid_until: '2027-03-31',
  //     source: 'Exported from my operator\'s published timetable',
  //     attribution: ['Timetable data: <operator name>, <licence>']
  //   });
  // },
  //
  // loadData: async function () {
  //   // A realtime API you have access to (see adapters/realtime-json-adapter.js).
  //   // Many APIs need a key and/or block browser requests (CORS); a small
  //   // server-side relay you control is often required. A key placed here is
  //   // visible to anyone who can open the page.
  //   const res = await fetch('https://example.invalid/your-relay/arrivals?stop=XYZ');
  //   if (!res.ok) throw new Error('HTTP ' + res.status);
  //   return TransitAdapters.fromRealtimeJson(await res.json(), {
  //     is_demo: false, dataset_id: 'my-live', timezone: 'Europe/London', max_age_sec: 120
  //   });
  // },
  loadData: null
};
