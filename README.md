# 🤖 AI 分析模組 — StreetFix Taiwan

> **組員三負責範圍**：Gemini API 串接、圖片分析、問題分類、自動摘要生成、嚴重程度判斷

---

## 📁 檔案結構

```
ai-analysis/
├── lib/
│   ├── analyzeReport.js   # 核心分析邏輯（Gemini API 呼叫 + JSON 解析）
│   ├── imageUtils.js      # 圖片 Base64 轉換 + 壓縮工具
│   ├── useAIAnalysis.js   # React Hook（供前端組員一使用）
│   └── AIResultCard.jsx   # 分析結果顯示元件（供前端組員一使用）
├── api/
│   └── analyze.js         # Next.js API Route（/api/ai/analyze）
├── tests/
│   └── test-ai.mjs        # 測試腳本
└── README.md
```

---

## ⚙️ 環境設定

在專案根目錄的 `.env.local` 加入：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> 到 [Google AI Studio](https://aistudio.google.com/app/apikey) 免費取得 API Key

---

## 🚀 快速開始

### 1. API 端點呼叫（POST /api/ai/analyze）

```javascript
// 有圖片的通報
const formData = new FormData();
formData.append("image", imageFile);         // File 物件
formData.append("description", "路面有坑洞"); // 文字描述
formData.append("reportId", "report_001");   // 通報單ID

const res = await fetch("/api/ai/analyze", { method: "POST", body: formData });
const { success, data } = await res.json();
```

### 2. 在 React 元件中使用 Hook（給前端組員一）

```jsx
import { useAIAnalysis } from "@/ai-analysis/lib/useAIAnalysis";
import AIResultCard from "@/ai-analysis/lib/AIResultCard";

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

## 📊 AI 分析回傳格式

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

## 🧪 執行測試

```bash
# 安裝依賴（若需要）
npm install

# 設定 API Key 後執行測試
node tests/test-ai.mjs
```

如要測試圖片分析，請在 `tests/` 資料夾放入 `test-image.jpg`。

---

## 🔗 與其他組員的介接

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

## 📚 參考資料

- [Gemini API 文件](https://ai.google.dev/docs)
- [Google AI Studio（取得 API Key）](https://aistudio.google.com/app/apikey)
- [Gemini 圖片分析教學](https://ai.google.dev/gemini-api/docs/vision)
