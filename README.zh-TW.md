# Transit Board — 「我還有幾分鐘要出門？」

一頁式的出門倒數看板，只回答一個問題：**還有幾分鐘要走出家門？**
單一 HTML 檔，不需要建置、沒有框架、沒有追蹤，自己也不會連任何網路。

**線上 demo：**<https://nullinbetween.github.io/transit-board/>（虛構示範資料）

[English → README.md](README.md)

<table>
<tr>
<td width="50%"><img src="docs/images/board-demo.png" alt="使用內建虛構示範資料的看板，頂端有紅色 DEMO 橫幅"></td>
<td width="50%"><img src="docs/images/board-own-data.png" alt="放入自己的時刻表後：沒有 DEMO 橫幅，一條路線在倒數"></td>
</tr>
<tr>
<td>剛下載：虛構示範資料，永遠標示 <b>DEMO</b>。</td>
<td>照下方約 10 分鐘的教學做完：自己的站，沒有橫幅。</td>
</tr>
</table>

> **這不是下載就能直接搭車的 app。** 本專案**不附任何真實時刻表**，也不會自己連任何交通 API。
> 要實際使用，必須放入你自己當地的時刻表（見下方教學，約 10 分鐘；或交給 AI 程式助手代為轉換）。
> 在那之前，畫面會一直顯示 DEMO 警告——這是刻意的設計。

---

## 設計筆記——我們怎麼想的

大部分交通 app 給你一張時刻表，剩下的算術留給你。站在門口時，你要的不是時刻表，而是一個數字：

```
還有幾分鐘出門 = 下一班發車時間 − 現在 − 從家門到站上的分鐘數
```

其他設計都是認真對待這一個數字的結果。

| 決定 | 為什麼 | 我們接受的代價 |
|---|---|---|
| 顯示**「還有 N 分鐘出門」**，不先秀發車時刻 | 這才是站在門口真正的問題。完整時刻表點一下就有（All departures today）。 | 第一眼的資訊量變少。 |
| **「家門到站」的時間寫進資料**，每站可以自己改 | 「走路時間」其實是走路＋等電梯＋找鑰匙，只有你知道。 | 只存在該瀏覽器（localStorage），不會同步。 |
| **沒有「今天沒車了」** | 深夜正是最需要答案的時候。看板從昨天那欄一路往後看最多八個營運日，告訴你下一班還有多久——就算是「tomorrow 06:10」，或只在平日行駛的路線在週六顯示「Mon 06:10」。 | 計算必須處理凌晨 4 點才結束的營運日。 |
| 一個營運日**到凌晨 4 點才結束** | 紙本時刻表會把 00:15 那班印在**週六**欄。欄內的 `00:15`（或 GTFS 寫法 `24:15`）代表「同一營運日的午夜後」。 | 資料作者必須懂這條規則（寫在 `DATA_FORMAT.zh-TW.md`）。 |
| 下一班的間隔**只給數字，不給建議** | 「下一班 +15 分」讓你自己決定要不要跑。告訴別人**該怎麼做**是他自己的判斷。 | — |
| **示範資料永遠不能被當成真的** | 看起來像真的示範資料很危險。只有寫明 `is_demo: false`、**而且**不是內建示範資料集，才算真實資料；檔案存在不算數。 | 必須明確開啟。 |
| **資料過期就大聲警告** | 自信地給出錯誤答案，比沒有看板更糟。時刻表過期、假日清單過期、即時資料太舊都會警告。 | — |
| **假日由資料提供，並附有效期限** | 早期版本手打的假日清單後來發現漏了一個補假；如果沒抓到，那天看板會默默套用平日時刻表。現在清單必須寫明涵蓋到哪天，過了就警告。 | 清單要自己維護。 |
| **不用第三方代理、頁面裡不放秘密** | 早期版本透過公開的 CORS 代理讀取私人行事曆，等於每次開頁面都把行事曆的私密網址（實質上就是密碼）交給陌生人的伺服器。這個功能已移除；需要私人資料時，請用自己控制的轉接伺服器。 | 本版沒有行事曆整合。 |
| **看板從不自己連網** | 各城市的交通資料都不同、常需要金鑰、各有授權條款。看板只會呼叫**你自己寫**的 `loadData()`。 | 設定多一步；但不會有意料之外的網路流量。 |
| **純 HTML、淺色主題、對比 5:1 以上** | 手機上一開就能用，一眼看得清楚。 | 沒有深色模式。 |

## 快速試用（30 秒）

1. 下載或 clone 這個資料夾。
2. 雙擊 `transit-board.html`。

你會看到虛構的示範看板。瀏覽器主控台會有一筆「找不到 config.local.js」的錯誤，無害——那個檔案是要由你建立的。

## 教學：約 10 分鐘做出你自己的看板

你需要：你的站、**平日／週六／週日假日**各自的發車時刻、你所在的時區（例如 `Asia/Tokyo`、`Europe/London`）。
時刻從哪裡來由你決定——營運商網站、紙本時刻表、GTFS 檔都可以。

### A. 只改一個檔（不需伺服器，雙擊就能用）——已實測

1. 在同一個資料夾，把 `config.example.js` 複製成 **`config.local.js`**。（`*.local.js` 已列入 `.gitignore`，你的站點不會被不小心推上 git。）
2. 把內容換成下面這段，再改成你的站、路線與時刻：

```js
// config.local.js — 我自己的看板
window.TRANSIT_CONFIG = { title: 'My departures' };

window.TRANSIT_DATA = {
  format: 'transit-board/v1',
  dataset_id: 'my-board',
  is_demo: true,                  // 核對時刻期間保持 true；第 4 步再改成 false
  kind: 'static',
  timezone: 'Europe/London',      // 時刻表所用的時區
  valid_until: '2027-03-31',      // 時刻表有效的最後一天
  source: 'Typed in from the operator timetable',
  generated: '2026-10-21',        // 你輸入資料的日期
  attribution: [],
  calendar: {
    holidays: { '2026-12-25': 'Christmas Day', '2026-12-26': 'Boxing Day' },
    holidays_until: '2026-12-31'
  },
  stops: [{
    id: 'elm-road',
    label: 'Elm Road',
    walk_min: 4,                  // 從家門到站上的分鐘數
    lanes: [{
      id: 'to-town',
      line: 'Bus 7',
      to: 'Town Centre',
      services: {
        wd: ['06:40', '07:10', '07:40', '08:10', '08:40', '09:40', '10:40', '11:40', '12:40', '13:40',
             '14:40', '15:40', '16:40', '17:10', '17:40', '18:40', '19:40', '21:40', '23:40'].map(t => ({ t })),
        sa: ['08:15', '09:15', '10:15', '11:15', '12:15', '13:15', '14:15', '15:15', '16:15', '17:15', '18:15'].map(t => ({ t })),
        su: ['09:30', '11:30', '13:30', '15:30', '17:30'].map(t => ({ t }))
      }
    }]
  }]
};
```

3. 雙擊 `transit-board.html`，確認：
   - 沒有出現「The loaded data cannot be used」（如果有，它會列出是哪個欄位錯）；
   - 倒數時間等於時刻表減掉你的步行時間。

   這時紅色 DEMO 橫幅還在——這是刻意的：在你明確說明之前，看板都把資料當成範例。
4. 確認時刻都換成你自己的、也核對過之後，把 `is_demo: true` 改成 `is_demo: false` 再重新整理。DEMO 橫幅消失，頁籤標題變成「My departures」。

要加站或方向：在 `stops`、`lanes` 裡加物件。只開到中途的班次：`{ t: '13:40', short_to: 'Depot' }`。

### B. 用試算表（CSV）管理時刻——已實測

想用試算表的話，匯出成 CSV，標題列照 `examples/sample-timetable.csv`：

```
stop_id,stop_label,walk_min,lane_id,line,to,day_type,time,short_to
elm-road,Elm Road,4,to-town,Bus 7,Town Centre,wd,07:10,
```

存成看板旁邊的 `my-timetable.csv`，`config.local.js` 改成：

```js
window.TRANSIT_CONFIG = {
  title: 'My departures',
  refresh_sec: 300,
  loadData: async function () {
    const csv = await (await fetch('my-timetable.csv')).text();
    return TransitAdapters.fromSimpleCsv(csv, {
      is_demo: true,              // my-timetable.csv 換成你核對過的真實時刻後，再改成 false
      dataset_id: 'my-board', timezone: 'Europe/London',
      valid_until: '2027-03-31', generated: '2026-10-21',
      source: 'Typed in from the operator timetable'
    });
  }
};
```

瀏覽器會擋下雙擊開啟的頁面裡的 `fetch()`，所以改用本機伺服器提供這個資料夾：

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

再打開 <http://127.0.0.1:8765/transit-board.html>。

### C. 交給 AI 程式助手

把**整個資料夾**和**你的時刻表**（文字、試算表或截圖）一起交給 AI 助手（Claude、Codex 等），附上：

```text
這是一個出門倒數看板（transit-board）。請先讀 README.md 和 DATA_FORMAT.md。
把我附上的時刻表轉成 transit-board/v1 格式，寫進新的 config.local.js（設定 window.TRANSIT_DATA）。
- is_demo: 先設 true——我核對過時刻後會自己改成 false
- timezone: "<我的時區，例如 Asia/Tokyo>"
- valid_until: "<時刻表有效期限，YYYY-MM-DD>"
- walk_min：從我家到每個站要走 <N> 分鐘
- 若有當地假日清單，填進 calendar.holidays 和 calendar.holidays_until
不要修改 transit-board.html 和其他既有檔案。
完成後告訴我怎麼確認（沒有資料錯誤、倒數時間和時刻表一致），以及核對完要在哪裡把 is_demo 改成 false。
```

轉出來的時刻請自己對過一次，再把 `is_demo` 改成 `false`。看板只負責計算，資料錯了它也不會知道。

### D. 放到手機或門口的平板——未在實機上驗證

看板是純靜態檔案，任何靜態主機都能放（GitHub Pages、Netlify、家裡的伺服器）。在裝置上打開網址後「加入主畫面」即可。
用 git 發布時注意：`config.local.js` 是刻意被 git 忽略的（`.gitignore` 裡有兩行：`config.local.js` 與 `*.local.js`）。只有在你接受自己的站點公開時，才在**你自己的 fork** 裡明確加入它——其他檔案的忽略規則維持不變：

```bash
git add -f config.local.js
```

## 靜態時刻表 vs 即時資料

| | 靜態（`kind: "static"`） | 即時（`kind: "realtime"`） |
|---|---|---|
| 內容 | 公布的時刻表 | 某個時間點的到站預估 |
| 何時過期 | 時刻表或假日清單改版（`valid_until`） | 幾分鐘內（`max_age_sec`） |
| 畫面標示 | `Scheduled` | `Live estimate` |

即時資料可參考 `adapters/realtime-json-adapter.js` 範本，把欄位名稱改成你的 API 的。
很多 API 需要金鑰、而且不允許瀏覽器直接讀取（CORS）。放在 `config.local.js` 的金鑰，任何能打開頁面的人都看得到；
公開使用時請透過你自己控制的轉接伺服器，不要用公開的 CORS 代理。你所在的地區有沒有可用的資料各不相同，本專案無法保證。

## 運作方式

- `transit-board.html` 包含介面和一段純函式（`<script id="core-logic">`）：時區處理、營運日判斷、昨天／今天／明天的候選班次、驗證與過期檢查。測試直接載入這一段。
- 資料遵守同一份約定 [`DATA_FORMAT.zh-TW.md`](DATA_FORMAT.zh-TW.md)（`transit-board/v1`；英文版 [`DATA_FORMAT.md`](DATA_FORMAT.md)），顯示前先驗證；無效資料只顯示問題清單，**不顯示任何班次**。
- 所有來自資料的文字都會轉義；連結只接受 `http(s)`。

## 測試

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

打開 <http://127.0.0.1:8765/tests/core.test.html>，共 55 項（示範標記、時區、午夜後班次、週末與連假、時刻表有效期的終點、假日與假日清單的終點、過期資料、即時資料、驗證——不存在的日期與時間戳、錯誤的 JSON 型別——、轉義、兩個轉接器，以及兩項介面檢查，包括「一次只發一個資料請求，慢的回應照樣套用」）。頁籤標題會顯示 `PASS n/n` 或 `FAIL`。

## 從個人工具到開源

它原本是為作者自己的站點設定的看板。為了公開，我們做了這些事：

- 移除所有真實地點、座標與私人整合，改成**永遠不會被當成真的虛構示範資料**；
- 把寫死的設定改成有文件、有驗證的資料格式，支援時區、靜態／即時資料，附兩個轉接範例；
- 移除自動抓天氣與內建假日清單，讓頁面在你沒加之前**不發出任何網路請求**；
- 加上只使用虛構資料的瀏覽器測試。

已知限制（日光節約時間的邊界情況、假日規則、未測的瀏覽器）列在 [`ISSUES.md`](ISSUES.md)。

## 製作方式

由作者為日常使用而設計，程式以 AI 程式助手協作寫成。開源準備是一個小型多代理流程：**Codex** 負責界定範圍並獨立驗收，**Claude** 負責依白名單複製、移除個人資料、修正缺陷、撰寫測試與文件，最終決定由作者做出。

## 授權

[MIT](LICENSE)。第三方素材：無（見 [`ASSET_REGISTER.md`](ASSET_REGISTER.md)）。你加入的時刻表資料依其來源的條款使用——需要標示的請填進資料的 `attribution` 欄位。

---

Made by [@nullinbetween](https://x.com/nullinbetween) · apps by meredith · [appsbymeredith.carrd.co](https://appsbymeredith.carrd.co)
