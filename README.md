# StreetFix Taiwan — AI 分析模組

## 快速開始

1. 安裝依賴
```bash
npm install
```

2. 建立 `.env.local`（已建立，包含 GEMINI_API_KEY）

3. 啟動開發伺服器
```bash
npm run dev
```

4. 測試 AI API
```bash
curl -X POST http://localhost:3000/api/ai/analyze \
  -F "description=路面有大坑洞很危險"
```

## API 端點

**POST** `http://localhost:3000/api/ai/analyze`

| 欄位 | 類型 | 說明 |
|------|------|------|
| image | File | 現場照片（可選） |
| description | string | 文字描述（可選） |

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
