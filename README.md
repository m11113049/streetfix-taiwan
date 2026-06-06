# 🤖 AI 分析模組 — StreetFix Taiwan
**組員三負責**：title / category / severity / ai_summary / ai_suggested_action / ai_tags / ai_confidence

---

## 📁 檔案放置位置

```
streetfix-taiwan/
├── .env.local                          ← 放 API Key（不要 commit！）
├── lib/
│   ├── analyzeReport.js                ← 核心：Gemini API + 驗證 + 組裝格式
│   ├── imageUtils.js                   ← 圖片壓縮 / Base64 轉換
│   ├── useAIAnalysis.js                ← React Hook（給前端組員一）
│   └── AIResultCard.jsx               ← 結果顯示元件（給前端組員一）
├── app/api/ai/analyze/
│   └── route.js                        ← 把 api/analyze.js 內容放這
└── tests/
    └── test-ai.mjs
```

**`.env.local` 內容：**
```
GEMINI_API_KEY=AIzaSyCweviiyBGidk-ECV5DNgimeyljZ9hnNQY
```

---

## 📊 全組統一通報資料格式

```json
{
  "title": "校門口道路出現大型坑洞",
  "description": "校門口道路有明顯坑洞，機車經過容易發生危險",
  "category": "道路破損",
  "severity": "high",
  "imageUrl": "",
  "location": { "lat": 24.801, "lng": 120.971 },
  "status": "pending",
  "ai_summary": "偵測到大型坑洞，可能影響行車安全",
  "ai_suggested_action": "立即設置警示並安排修補",
  "ai_tags": ["交通安全", "路面修繕"],
  "ai_confidence": 0.92,
  "createdAt": "firebase server timestamp"
}
```

### 各欄位負責組別

| 欄位 | 類型 | 負責 |
|------|------|------|
| title | string | **AI** |
| description | string | 前端 |
| category | string | **AI** |
| severity | string | **AI** |
| imageUrl | string | 前端 |
| location.lat / lng | number | 前端 |
| status | string | 後端 |
| ai_summary | string | **AI** |
| ai_suggested_action | string | **AI** |
| ai_tags | array | **AI** |
| ai_confidence | number | **AI** |
| createdAt | timestamp | 後端 |

### category 固定值（7 個）
`道路破損` / `路燈故障` / `垃圾堆積` / `排水異常` / `人行道破損` / `交通號誌異常` / `其他`

### severity 固定值（3 個）
`low`（輕微）/ `medium`（中等）/ `high`（嚴重）

### status 固定值（後端管理）
`pending` / `processing` / `resolved`

---

## 🔗 各組介接

### 給前端組（組員一）
```jsx
import { useAIAnalysis } from "@/lib/useAIAnalysis";
import AIResultCard from "@/lib/AIResultCard";

const { analyze, result, loading, error } = useAIAnalysis();

// 觸發分析
await analyze({ file, description, location: { lat, lng } });

// 顯示結果
<AIResultCard result={result} loading={loading} error={error} />
```

### 給地圖組（組員二）
- `result.severity`：`low`=綠標 / `medium`=黃標 / `high`=紅標
- `result.category`：決定標記圖示

### 給後端整合組（組員四）
- `POST /api/ai/analyze`（FormData: image + description）
- 回傳的 result 可直接存入 Firebase，再補上 `status` 和 `createdAt`

---

## 🧪 測試
```bash
GEMINI_API_KEY=你的key node tests/test-ai.mjs
```
