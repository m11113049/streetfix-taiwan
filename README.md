# 🤖 AI 分析模組 — StreetFix Taiwan

> **組員三負責範圍**：Gemini API 串接、圖片分析、問題分類、自動摘要生成、嚴重程度判斷

---

## 快速開始

1. 安裝依賴

```bash
npm install
```

2. 建立 `.env.local`（包含 GEMINI_API_KEY，到 [Google AI Studio](https://aistudio.google.com/app/apikey) 免費取得）

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

3. 啟動開發伺服器

```bash
npm run dev
```

4. 測試 AI API

```bash
curl -X POST http://localhost:3000/api/ai/analyze \
  -F "description=路面有大坑洞很危險"
```

---

## API 端點

**POST** `/api/ai/analyze`

| 欄位 | 類型 | 說明 |
|------|------|------|
| image | File | 現場照片（可選） |
| description | string | 文字描述（可選） |
| reportId | string | 通報單 ID（可選） |

```javascript
const formData = new FormData();
formData.append("image", imageFile);         // File 物件
formData.append("description", "路面有坑洞"); // 文字描述
formData.append("reportId", "report_001");   // 通報單ID

const res = await fetch("/api/ai/analyze", { method: "POST", body: formData });
const { success, data } = await res.json();
```

---

## 在 React 元件中使用 Hook（給前端組員一）

```jsx
import { useAIAnalysis } from "@/lib/useAIAnalysis";
import AIResultCard from "@/components/AIResultCard";

export default function ReportForm() {
  const { analyze, result, loading, error, progress } = useAIAnalysis();

  const handleSubmit = async () => {
    await analyze({
      file: selectedFile,       // File 物件
      description: userText,    // 文字描述
      reportId: "report_123",   // 通報ID
    });
  };

  return (
    <div>
      {/* 你的表單... */}
      <button onClick={handleSubmit}>送出並分析</button>
      {progress && <p>{progress}</p>}
      <AIResultCard result={result} loading={loading} error={error} />
    </div>
  );
}
```

---

## 檔案結構

```
streetfix-taiwan/
├── lib/
│   ├── analyzeReport.js    # Gemini API 核心
│   ├── imageUtils.js       # 圖片工具
│   └── useAIAnalysis.js    # React Hook
├── components/
│   └── AIResultCard.jsx    # 結果顯示元件
└── app/api/ai/analyze/
    └── route.js            # API 端點
```

---

## AI 分析回傳格式

```json
{
  "category": "道路坑洞",
  "category_key": "POTHOLE",
  "severity": "HIGH",
  "severity_label": "嚴重",
  "severity_score": 7,
  "summary": "忠孝東路大型坑洞，影響行車安全",
  "detail": "路面破損形成約直徑50公分坑洞，深度明顯，位於車道中央，來往車輛需繞行，雨天可能積水加劇危險。",
  "suggested_action": "立即設置警示標誌，安排路面修補，預計需填補瀝青處理。",
  "urgency_reason": "坑洞位於主要車道，深度與大小足以造成機車失控或車輛輪胎損壞。",
  "tags": ["交通安全", "路面修繕", "機車危險"],
  "confidence": 0.92,
  "severity_color": "#F44336",
  "severity_level": 3,
  "analyzed_at": "2026-06-06T12:00:00.000Z"
}
```

### 問題類別（category_key）

| Key | 中文名稱 |
|-----|---------|
| POTHOLE | 道路坑洞 |
| SIDEWALK | 人行道破損 |
| STREETLIGHT | 路燈故障 |
| GARBAGE | 垃圾堆積 |
| DRAINAGE | 排水異常 |
| FENCE | 護欄損壞 |
| SIGN | 標誌缺損 |
| OTHER | 其他設施問題 |

### 嚴重程度（severity）

| 等級 | 分數 | 說明 |
|------|------|------|
| CRITICAL 🚨 | 8–10 | 立即危及人身安全 |
| HIGH 🔴 | 5–7 | 影響安全，需盡快處理 |
| MEDIUM 🟡 | 3–4 | 潛在危險，建議近期處理 |
| LOW 🟢 | 1–2 | 輕微，可排程處理 |

---

## 執行測試

```bash
node test-ai.mjs
```

如要測試圖片分析，請在專案根目錄放入 `test-image.jpg`。

---

## 與其他組員的介接

### 給前端組（組員一）
- 引入 `useAIAnalysis` hook 使用 `analyze()` 觸發分析
- 引入 `AIResultCard` 元件顯示結果
- `loading`、`error`、`progress` 已包裝好，直接使用即可

### 給地圖組（組員二）
- `result.category_key` 可用來決定地圖標記顏色/圖示
- `result.severity` 可用來決定標記大小

### 給後端整合組（組員四）
- API 端點：`POST /api/ai/analyze`
- 回傳的 JSON 欄位對應 Supabase 資料表欄位：
  - `category_key` → `category`
  - `severity` → `severity`
  - `severity_score` → `severity_score`
  - `summary` → `ai_summary`
  - `detail` → `ai_detail`
  - `tags` → `tags`（JSONB 陣列）
  - `analyzed_at` → `analyzed_at`

---

## 參考資料

- [Gemini API 文件](https://ai.google.dev/docs)
- [Google AI Studio（取得 API Key）](https://aistudio.google.com/app/apikey)
- [Gemini 圖片分析教學](https://ai.google.dev/gemini-api/docs/vision)
