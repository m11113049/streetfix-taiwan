# StreetFix Taiwan — AI 輔助城市公共設施通報平台

## 一、專案簡介

StreetFix Taiwan 是一個結合「地圖定位、Firebase 後端、AI 自動分析、前端通報介面」的城市公共設施通報平台。

使用者可以在網頁上新增公共設施問題通報，例如：

- 道路破損
- 路燈故障
- 垃圾堆積
- 排水異常
- 人行道破損
- 交通號誌異常
- 其他

目前已完成的整合包含：

1. 前端通報介面
2. Leaflet 地圖顯示通報點位
3. 新增通報後寫入 Firebase Firestore
4. 重新整理後資料仍會保留
5. 可刪除通報，並同步從 Firebase 移除
6. 串接 AI 分析 API `/api/ai/analyze`
7. AI 可根據描述與圖片分析：
   - 問題分類 category
   - 嚴重程度 severity
   - AI 摘要 summary
   - 建議處置 priority / action
8. 前端 UI 已整理通報卡片、展開資訊與 AI 分析結果

---

## 二、目前主要分支

目前整合完成的主要分支：

```bash
main
```

建議 Demo、測試與後續整合都先以此分支為主。

切換分支：

```bash
git checkout integration-ai-map
```

確認目前所在分支：

```bash
git branch
```

---

## 三、專案目錄結構說明

目前專案大致分為兩個主要部分：

```bash
streetfix-taiwan/
│
├── backend/
│   ├── routes/
│   │   └── reports.js
│   ├── config/
│   │   └── firebase-service-account.json   # Firebase 金鑰，不可上傳 GitHub
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── streetfix-web/
    ├── app/
    │   ├── page.tsx
    │   └── api/
    │       └── ai/
    │           └── analyze/
    │               └── route.js
    ├── components/
    │   └── MapComponent.tsx
    ├── lib/
    │   ├── report.ts
    │   └── analyzeReport.js
    ├── public/
    │   ├── marker-icon.png
    │   ├── marker-icon-2x.png
    │   └── marker-shadow.png
    ├── package.json
    └── .env.local
```

> 實際檔案名稱可能因各組員版本略有不同，但目前 Demo 主要會使用 `backend` 與 `streetfix-web` 兩個目錄。

---

## 四、各檔案功能說明

### 1. `backend/server.js`

後端主程式。

主要功能：

- 啟動 Express Server
- 設定 API 路由
- 設定 CORS
- 讓前端可以呼叫後端 API

後端預設執行位置：

```bash
http://localhost:5000
```

---

### 2. `backend/routes/reports.js`

通報資料 API。

目前主要負責：

#### 取得所有通報

```http
GET /api/reports
```

用途：

- 前端地圖載入時，從 Firebase 讀取所有通報資料
- 重新整理頁面後，通報點位仍會存在

#### 新增通報

```http
POST /api/reports
```

用途：

- 使用者在前端新增通報後，把資料寫入 Firebase Firestore

目前必要欄位包含：

```json
{
  "title": "通報標題",
  "description": "問題描述",
  "latitude": 23.7,
  "longitude": 120.5,
  "category": "道路破損",
  "severity": "medium"
}
```

#### 刪除通報

```http
DELETE /api/reports/:id
```

用途：

- 前端點擊刪除後，從 Firebase 移除指定通報
- 避免重新整理後資料又出現

---

### 3. `backend/config/firebase-service-account.json`

Firebase Admin SDK 金鑰。

用途：

- 讓後端可以連線到 Firebase Firestore
- 讀取、新增、刪除通報資料

重要提醒：

這個檔案包含敏感金鑰，**不可上傳到 GitHub**。

`.gitignore` 裡面應該要包含：

```bash
.env
.env.local
config/firebase-service-account.json
```

或至少確保 Firebase 金鑰檔案不會被 commit。

---

### 4. `streetfix-web/app/page.tsx`

前端首頁。

目前 Demo 進入網址：

```bash
http://localhost:3000
```

主要功能：

- 顯示通報系統主畫面
- 顯示地圖
- 顯示通報表單
- 顯示通報清單
- 整合 AI 分析結果
- 整合新增與刪除通報功能

如果 `page.tsx` 放在：

```bash
streetfix-web/app/page.tsx
```

代表首頁就是：

```bash
http://localhost:3000
```

如果未來改成：

```bash
streetfix-web/app/report/page.tsx
```

則網址會變成：

```bash
http://localhost:3000/report
```

目前 Demo 建議維持在首頁，操作比較直覺。

---

### 5. `streetfix-web/components/MapComponent.tsx`

地圖元件。

主要功能：

- 使用 Leaflet / React Leaflet 顯示地圖
- 顯示所有通報的大頭針 Marker
- 點擊地圖可取得經緯度
- 點擊 Marker 可查看該筆通報資訊
- 使用自訂大頭針圖片，避免預設 icon 不顯示

Leaflet marker 圖片需要放在：

```bash
streetfix-web/public/
```

例如：

```bash
public/marker-icon.png
public/marker-icon-2x.png
public/marker-shadow.png
```

對應程式碼大致如下：

```ts
const markerIcon = new L.Icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
```

如果大頭針不見，通常要檢查：

1. 圖片是否真的放在 `public/`
2. 檔名是否完全一致
3. `iconUrl` 是否使用 `/marker-icon.png`
4. 是否重新啟動 `npm run dev`

---

### 6. `streetfix-web/lib/report.ts`

前端通報資料型別與資料處理檔案。

可能負責：

- 定義 Report 型別
- 統一通報資料格式
- 對齊後端 Firebase 欄位
- 對齊 AI 分析後回傳格式

建議統一通報資料格式如下：

```ts
export type Report = {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  severity: "low" | "medium" | "high";
  status?: string;
  summary?: string;
  priority?: string;
  action?: string;
  createdAt?: string;
};
```

---

### 7. `streetfix-web/app/api/ai/analyze/route.js`

Next.js API Route。

AI 組 API 路徑：

```http
POST http://localhost:3000/api/ai/analyze
```

用途：

- 前端送出描述與圖片
- 呼叫 Gemini / AI 分析邏輯
- 回傳分類、嚴重程度、摘要與建議處置
- 前端再把結果整合進通報資料

---

### 8. `streetfix-web/lib/analyzeReport.js`

AI 分析邏輯。

主要功能：

- 建立 Prompt
- 呼叫 Gemini API
- 限制 AI 回傳固定格式
- 避免 category / severity 出現後端不接受的值
- 將 AI 回傳結果整理成前後端都能使用的 JSON

目前全組固定 category 建議如下：

```js
export const CATEGORIES = [
  "道路破損",
  "路燈故障",
  "垃圾堆積",
  "排水異常",
  "人行道破損",
  "交通號誌異常",
  "其他",
];
```

severity 固定值：

```js
export const SEVERITY_VALUES = ["low", "medium", "high"];
```

---

## 五、環境變數設定

### 1. 後端 `.env`

位置：

```bash
backend/.env
```

可能需要：

```env
PORT=5000
```

如果 Firebase 金鑰路徑有寫在環境變數，也可以放：

```env
GOOGLE_APPLICATION_CREDENTIALS=./config/firebase-service-account.json
```

---

### 2. 前端 `.env.local`

位置：

```bash
streetfix-web/.env.local
```

Gemini API Key 建議放這裡：

```env
GEMINI_API_KEY=你的_Gemini_API_Key
```

注意：

`.env.local` 不要上傳到 GitHub。

---

## 六、安裝方式

第一次拿到專案時，請分別安裝後端與前端套件。

### 1. 安裝後端套件

```bash
cd streetfix-taiwan/backend
npm install
```

### 2. 安裝前端套件

開另一個終端機：

```bash
cd streetfix-taiwan/streetfix-web
npm install
```

---

## 七、啟動方式

Demo 時需要同時開兩個終端機。

---

### Terminal 1：啟動後端

```bash
cd streetfix-taiwan/backend
npm run dev
```

後端預設位置：

```bash
http://localhost:5000
```

如果成功，應該會看到類似：

```bash
Server running on port 5000
```

---

### Terminal 2：啟動前端

```bash
cd streetfix-taiwan/streetfix-web
npm run dev
```

前端預設位置：

```bash
http://localhost:3000
```

如果成功，瀏覽器打開：

```bash
http://localhost:3000
```

---

## 八、Demo 操作流程

以下是建議 Demo 影片展示順序。

---

### Step 1：啟動後端

在第一個終端機執行：

```bash
cd streetfix-taiwan/backend
npm run dev
```

確認後端正常啟動。

---

### Step 2：啟動前端

在第二個終端機執行：

```bash
cd streetfix-taiwan/streetfix-web
npm run dev
```

打開：

```bash
http://localhost:3000
```

---

### Step 3：展示首頁與地圖

展示內容：

- 系統首頁
- 地圖正常顯示
- 通報 Marker 正常顯示
- 通報清單正常顯示

可以說明：

> 這裡是 StreetFix Taiwan 的主畫面，使用者可以新增通報，地圖上會顯示目前 Firebase 中所有通報資料。

---

### Step 4：新增一筆通報

可以輸入範例：

```txt
標題：道路坑洞
描述：斗六市中山路附近路面有明顯坑洞，機車經過可能會有危險。
分類：道路破損
嚴重程度：high
位置：點擊地圖取得經緯度
```

送出後確認：

1. 前端出現新通報
2. 地圖新增 Marker
3. Firebase Firestore 新增一筆資料
4. 重新整理頁面後資料仍存在

---

### Step 5：展示 AI 分析

如果前端有 AI 分析按鈕或自動分析流程，可以展示：

1. 輸入描述
2. 上傳圖片，或只用文字描述
3. 呼叫：

```http
POST /api/ai/analyze
```

AI 回傳結果可能包含：

```json
{
  "category": "道路破損",
  "severity": "high",
  "summary": "路面出現坑洞，可能影響機車與汽車行駛安全。",
  "priority": "高",
  "action": "建議派員確認並安排修補。"
}
```

前端顯示時建議用清楚標題：

```txt
AI 分析摘要：
路面出現坑洞，可能影響機車與汽車行駛安全。

問題分類：
道路破損

嚴重程度：
high

處置優先度：
高

建議處置：
建議派員確認並安排修補。
```

---

### Step 6：展示展開通報資訊

點擊某筆通報後，可以展示詳細資訊，例如：

```txt
通報標題：道路坑洞
問題分類：道路破損
嚴重程度：高
處理狀態：待處理
通報描述：斗六市中山路附近路面有明顯坑洞
AI 摘要：路面出現坑洞，可能影響行車安全
建議處置：建議派員確認並安排修補
```

目前 UI 已經避免全部文字擠在一起，改成標題與內容分開，讓隊友與 Demo 觀眾比較容易理解。

---

### Step 7：刪除通報

選擇一筆測試資料，點擊刪除。

確認：

1. 前端清單移除該筆資料
2. 地圖 Marker 消失
3. Firebase Firestore 也同步刪除
4. 重新整理後不會再次出現

---

## 九、API 測試方式

如果要用 Postman 測試後端 API，可使用以下方式。

---

### 1. 取得所有通報

Method：

```http
GET
```

URL：

```http
http://localhost:5000/api/reports
```

---

### 2. 新增通報

Method：

```http
POST
```

URL：

```http
http://localhost:5000/api/reports
```

Body 選擇 JSON：

```json
{
  "title": "測試通報",
  "description": "這是一筆測試用的道路破損通報",
  "latitude": 23.7075,
  "longitude": 120.5439,
  "category": "道路破損",
  "severity": "medium"
}
```

成功後 Firebase 應該會新增一筆資料。

---

### 3. 刪除通報

Method：

```http
DELETE
```

URL：

```http
http://localhost:5000/api/reports/通報ID
```

例如：

```http
http://localhost:5000/api/reports/abc123
```

---

### 4. 測試 AI 分析 API

Method：

```http
POST
```

URL：

```http
http://localhost:3000/api/ai/analyze
```

Body 使用 `form-data`：

| Key | Type | 說明 |
|---|---|---|
| description | Text | 問題描述 |
| image | File | 現場圖片，可選 |

範例 description：

```txt
路面有明顯坑洞，車輛經過時容易晃動，晚上可能造成機車危險。
```

預期回傳：

```json
{
  "category": "道路破損",
  "severity": "high",
  "summary": "道路出現坑洞，可能影響行車安全。",
  "priority": "高",
  "action": "建議派員確認並安排修補。"
}
```

---

## 十、目前整合狀態

### 已完成

- [x] 後端 Express API
- [x] Firebase Firestore 串接
- [x] Postman 測試新增資料成功
- [x] 前端地圖顯示
- [x] 前端新增通報
- [x] Firebase 資料重新整理後仍保留
- [x] 刪除通報功能
- [x] AI API `/api/ai/analyze` 串接
- [x] AI category 與 severity 對齊後端格式
- [x] 前端 UI 顯示 AI 分析結果
- [x] Marker icon 修正
- [x] Demo 流程可執行

---

### 尚可優化

- [ ] 通報圖片上傳後儲存到 Firebase Storage
- [ ] 通報狀態更新，例如：待處理、處理中、已完成
- [ ] 管理者後台
- [ ] 搜尋與篩選通報
- [ ] 依照 category 顯示不同 Marker 顏色
- [ ] 依照 severity 排序
- [ ] 手機版 RWD 優化
- [ ] Vercel / Render / Firebase Hosting 部署
- [ ] AI quota 問題處理(Gemini_key的quota不足問題)
- [ ] Demo 用假資料初始化

---

## 十一、常見問題

### Q1：為什麼前端打開後地圖沒有出現？

請確認：

1. 是否有安裝 Leaflet：

```bash
npm install leaflet react-leaflet
```

2. 是否有引入 Leaflet CSS：

```ts
import "leaflet/dist/leaflet.css";
```

3. `MapComponent.tsx` 是否有加上：

```ts
"use client";
```

4. 是否重新啟動前端：

```bash
npm run dev
```

---

### Q2：為什麼 Marker 大頭針不見？

請確認圖片是否放在：

```bash
streetfix-web/public/
```

檔案是否存在：

```bash
marker-icon.png
marker-icon-2x.png
marker-shadow.png
```

並確認程式碼使用：

```ts
iconUrl: "/marker-icon.png"
```

不是：

```ts
iconUrl: "./marker-icon.png"
```

---

### Q3：為什麼新增通報後重新整理就不見？

通常代表資料只存在前端 state，沒有成功寫入 Firebase。

請確認：

1. 後端 `POST /api/reports` 是否成功
2. Firebase Firestore 是否真的新增資料
3. 前端送出的欄位是否包含：

```json
{
  "title": "...",
  "description": "...",
  "latitude": 23.7,
  "longitude": 120.5
}
```

後端之前曾出現錯誤：

```json
{
  "status": "error",
  "message": "缺少必要欄位：title、description、latitude、longitude"
}
```

代表前端欄位名稱可能與後端不一致。

---

### Q4：為什麼 AI API 無法使用？

請確認：

1. 前端是否在 `streetfix-web` 內啟動：

```bash
npm run dev
```

2. API 路徑是否正確：

```http
http://localhost:3000/api/ai/analyze
```

3. `.env.local` 是否有 Gemini API Key：

```env
GEMINI_API_KEY=你的_API_KEY
```

4. AI 組是否超過 quota

如果只是 Demo，可以先在本機測試，不一定要先部署到 Vercel。

---

### Q5：Demo 時要開幾個 npm run dev？

需要開兩個。

第一個：後端

```bash
cd streetfix-taiwan/backend
npm run dev
```

第二個：前端

```bash
cd streetfix-taiwan/streetfix-web
npm run dev
```

瀏覽器開：

```bash
http://localhost:3000
```

---

## 十二、Demo 講解稿簡短版

可以照下面順序介紹：

```txt
這是我們的 StreetFix Taiwan 公共設施通報平台。

使用者可以在地圖上選擇位置，輸入問題描述，並新增一筆城市設施通報。

目前系統已經串接 Firebase，所以新增後的通報不只是顯示在前端，也會寫入資料庫。重新整理後資料仍會保留。

地圖上的 Marker 代表每一筆通報，點擊後可以看到詳細資訊，例如分類、嚴重程度、處理狀態與 AI 摘要。

我們也整合了 AI 分析功能，使用者輸入描述或上傳圖片後，AI 可以自動判斷問題分類、嚴重程度，並產生摘要與建議處置方式。

最後，管理者也可以刪除測試通報，刪除後 Firebase 也會同步移除，重新整理後不會再次出現。
```

---

## 十三、Demo 前檢查清單

Demo 前請確認：

- [ ] 已切換到 `integration-ai-map`
- [ ] Firebase 金鑰存在
- [ ] `.env` / `.env.local` 已設定
- [ ] 後端可正常啟動
- [ ] 前端可正常啟動
- [ ] `http://localhost:3000` 可打開
- [ ] 地圖正常顯示
- [ ] Marker 正常顯示
- [ ] 新增通報成功
- [ ] Firebase 有新增資料
- [ ] 重新整理後資料還在
- [ ] 刪除通報成功
- [ ] AI 分析 API 可正常回傳
- [ ] Demo 測試資料已準備好

---

## 十四、建議 Demo 測試資料

### 測試資料 1：道路破損

```txt
標題：道路坑洞
描述：斗六市中山路附近有明顯坑洞，機車經過時容易晃動，夜間可能造成危險。
分類：道路破損
嚴重程度：high
```

### 測試資料 2：路燈故障

```txt
標題：路燈不亮
描述：巷口路燈晚上完全不亮，行人經過時視線很差。
分類：路燈故障
嚴重程度：medium
```

### 測試資料 3：垃圾堆積

```txt
標題：垃圾堆積
描述：路邊長時間堆放垃圾，已經有異味並影響附近居民。
分類：垃圾堆積
嚴重程度：medium
```

---

## 十五、給組員的注意事項

1. 不要把 Firebase 金鑰上傳 GitHub。
2. 不要把 `.env` 或 `.env.local` 上傳 GitHub。
3. Demo 時要同時啟動後端與前端。
4. 後端是 `localhost:5000`。
5. 前端是 `localhost:3000`。
6. AI API 是 Next.js API Route，所以跑在 `localhost:3000`。
7. 新增通報時，欄位名稱一定要對齊後端。
8. 如果修改 category 或 severity，前端、後端、AI Prompt 都要一起同步。
9. 若 Marker 不見，優先檢查 `public` 裡的圖片。
10. 若資料重新整理後消失，優先檢查 Firebase 是否真的有新增資料。

---

## 十六、目前最終 Demo 指令總結

### 後端

```bash
cd streetfix-taiwan/backend
npm install
npm run dev
```

### 前端

```bash
cd streetfix-taiwan
npm install
npm run dev
```

### AI分析端

```bash
cd streetfix-taiwan/streetfix-web
npm install
npm run dev
```

### 開啟網站

```bash
http://localhost:3000
```

### 後端 API

```bash
http://localhost:5000/api/reports
```

### AI API

```bash
http://localhost:3000/api/ai/analyze
```

### 表單統計

```bash
http://localhost:3000/admin
```