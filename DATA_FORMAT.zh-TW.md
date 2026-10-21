# 資料格式 `transit-board/v1`

[English → DATA_FORMAT.md](DATA_FORMAT.md)

看板只吃一種資料格式。不管你的來源是官方 GTFS、營運商網頁、CSV 還是即時 API，都先轉成這個格式，再交給看板。
本專案不附真實時刻表；轉換這一步由使用者自己做（或交給 AI 程式助手，見 `README.md` 的 *Tutorial C* ／ `README.zh-TW.md` 的〈C. 交給 AI 程式助手〉）。

資料可以用兩種方式交給看板：

1. 在 `config.local.js`（或你自己的 `*.local.js`）裡設定 `window.TRANSIT_DATA = {...}`。
2. 在 `config.local.js` 裡寫 `loadData()`，回傳這個格式的物件。看板會依 `refresh_sec` 定期重新呼叫——但上一次還沒回來時不會再發，慢的來源會等它，而不是被打斷。`loadData()` 失敗或回傳空值時，畫面保留上一份資料並顯示錯誤橫幅。

## 頂層欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| `format` | ✅ | 固定為 `"transit-board/v1"` |
| `dataset_id` | 建議 | 資料集代號。`"demo-fictional"` 保留給內建示範資料 |
| `is_demo` | ✅ | **只有明確寫 `false` 才會被當成真實資料**。缺欄、`"false"` 字串、`true` 一律視為示範 |
| `kind` | ✅ | `"static"`（靜態時刻表）或 `"realtime"`（即時預估） |
| `timezone` | 建議 | IANA 時區，例如 `"Asia/Tokyo"`、`"Europe/London"`。沒填就用裝置時區，畫面會提示 |
| `source` | 建議 | 資料來源說明（顯示在 Settings） |
| `attribution` | 依來源授權 | 字串陣列；來源授權要求標示時一定要填 |
| `links` | 選填 | `[{label, url}]`，只顯示 `http(s)` 連結 |
| `service_day_end_hour` | 選填 | 一個「營運日」在幾點結束，預設 `4`（見下方〈跨日〉） |
| `generated` | 選填 | 資料產生日期 `YYYY-MM-DD` |

### 只有 `kind: "static"` 用到的欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| `valid_until` | ✅ | 時刻表有效期限 `YYYY-MM-DD`，必須是真的存在的日期；之後日期的班次一律不顯示，過期會顯示紅色警告且不顯示班次 |
| `calendar.holidays` | 建議 | `{"YYYY-MM-DD": "名稱"}`；沒有這份清單時，假日會當成平日（畫面會提示） |
| `calendar.holidays_until` | 建議 | 假日清單涵蓋到哪一天（有填就必須是存在的日期）。超出這天的班次會標示「holiday list ends …」；今天已經超過時，改為顯示警告橫幅 |
| `calendar.holiday_service` | 選填 | 假日用哪一欄時刻表：`"wd"`／`"sa"`／`"su"`，預設 `"su"` |

### 只有 `kind: "realtime"` 用到的欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| `fetched_at` | ✅ | 取得資料的時間，ISO 8601 **必須帶時區偏移**（`Z` 或 `+09:00`），日期與時間都必須存在 |
| `max_age_sec` | ✅ | 超過幾秒就視為過期，畫面會顯示警告 |

## `stops[]`（站點）

| 欄位 | 必填 | 說明 |
|---|---|---|
| `id` | ✅ | 站點代號（也用來儲存使用者自己設定的步行時間） |
| `label` | ✅ | 顯示名稱 |
| `sub` | 選填 | 副標 |
| `walk_min` | ✅ | 從出門到站上的預設分鐘數，0–90。使用者可在 Settings 改，只存在該瀏覽器 |
| `vehicle` | 選填 | 顯示用字，預設 `"bus"` |
| `target` | 選填 | 顯示用字，預設 `"stop"` |
| `lanes` | ✅ | 方向／路線陣列 |

不需要座標，也不建議放座標。

## `lanes[]`（方向）

| 欄位 | 必填 | 說明 |
|---|---|---|
| `id` | ✅ | 方向代號 |
| `line` | 建議 | 路線名稱 |
| `to` | 建議 | 終點 |
| `services` | static 必填 | `{wd: [...], sa: [...], su: [...]}`，每筆 `{t: "HH:MM", short_to?: "中途終點"}` |
| `predictions` | realtime 必填 | `[{at: "ISO 8601 含時區", short_to?: "..."}]` |

## 跨日（深夜班）

一個「營運日」到 `service_day_end_hour`（預設凌晨 4 點）才結束。所以：

- 週六欄裡的 `00:15` 代表**週六深夜**那班，也就是週日凌晨 00:15 開。
- 也接受 GTFS 寫法 `24:15`，意思相同。可用範圍 `00:00`–`47:59`。

看板從昨天那欄一路往後看最多八個營運日，所以任何時刻都會回答「下一班還有幾分鐘」，不會顯示「今天沒車了」；只在平日行駛的路線在週六會顯示週一的第一班。

## 靜態時刻表和即時預估的差別

| | 靜態（`static`） | 即時（`realtime`） |
|---|---|---|
| 內容 | 營運商公布的時刻表 | 某個時間點的到站預估 |
| 會過期的是 | 時刻表改版（`valid_until`）、假日清單 | 幾分鐘內就過期（`max_age_sec`） |
| 畫面標示 | `Scheduled` | `Live estimate` |
| 誤差 | 不反映誤點 | 反映誤點，但預估會變 |

## 驗證

看板載入資料時會先驗證。驗證失敗就**不顯示任何班次**，只顯示錯誤清單。
日期與時間戳會對照真實日曆：`2027-99-99`、`2026-02-30`、`+25:00` 這類時差都會被拒絕。
型別也會檢查：文字欄位必須是字串，`calendar` 與 `services` 必須是物件，`stops`、`lanes`、`links`、`attribution` 必須是陣列，假日清單的鍵必須是真的日期。
`tests/core.test.html` 示範了各種錯誤情況。

## 轉接範例

- `adapters/simple-csv-adapter.js`：CSV → 本格式（範例資料 `examples/sample-timetable.csv`）
- `adapters/realtime-json-adapter.js`：即時 JSON → 本格式（範例資料 `examples/sample-realtime.json`）

兩個轉接器只做轉換，不會自己連網。輸出預設 `is_demo: true`，必須由你明確傳入 `is_demo: false`。
