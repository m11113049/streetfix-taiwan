/**
 * StreetFix Taiwan — AI 分析核心模組
 * 組員三負責：Gemini API 串接、圖片分析、問題分類、摘要生成、嚴重程度判斷
 *
 * 使用方式：
 *   import { analyzeReport } from './lib/analyzeReport'
 *   const result = await analyzeReport({ imageBase64, mimeType, userDescription })
 */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * 問題類別定義
 * 後端整合時請對應此列表存入資料庫
 */
export const CATEGORIES = {
  POTHOLE: "道路坑洞",
  SIDEWALK: "人行道破損",
  STREETLIGHT: "路燈故障",
  GARBAGE: "垃圾堆積",
  DRAINAGE: "排水異常",
  FENCE: "護欄損壞",
  SIGN: "標誌缺損",
  OTHER: "其他設施問題",
};

/**
 * 嚴重程度定義
 */
export const SEVERITY = {
  LOW: { level: 1, label: "輕微", color: "#4CAF50" },
  MEDIUM: { level: 2, label: "中等", color: "#FF9800" },
  HIGH: { level: 3, label: "嚴重", color: "#F44336" },
  CRITICAL: { level: 4, label: "緊急", color: "#9C27B0" },
};

/**
 * 建立給 Gemini 的分析 Prompt
 * 明確要求回傳 JSON，方便後端解析
 */
function buildPrompt(userDescription) {
  return `
你是台灣城市公共設施通報系統的 AI 分析助手。
請根據使用者提供的照片與描述，分析公共設施問題，並以 JSON 格式回應。

使用者描述：「${userDescription || "（無文字描述）"}」

請從照片中辨識問題，並嚴格依照以下 JSON 格式回應，不要加任何額外文字或 markdown：

{
  "category": "道路坑洞 | 人行道破損 | 路燈故障 | 垃圾堆積 | 排水異常 | 護欄損壞 | 標誌缺損 | 其他設施問題",
  "category_key": "POTHOLE | SIDEWALK | STREETLIGHT | GARBAGE | DRAINAGE | FENCE | SIGN | OTHER",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "severity_label": "輕微 | 中等 | 嚴重 | 緊急",
  "severity_score": 1到10的整數,
  "summary": "30字以內的問題摘要（繁體中文）",
  "detail": "100字以內的詳細描述，包含問題位置特徵、受影響範圍（繁體中文）",
  "suggested_action": "建議的處理方式（繁體中文）",
  "urgency_reason": "說明為何判定此嚴重程度的理由（繁體中文）",
  "tags": ["相關標籤陣列，例如：交通安全、行人危險、積水風險"],
  "confidence": 0到1之間的浮點數，代表分析信心度
}

嚴重程度判斷標準：
- CRITICAL（緊急，分數8-10）：立即危及人身安全，例如深度坑洞、完全損壞護欄、完全無光的路段
- HIGH（嚴重，分數5-7）：影響行車或行人安全，需盡快處理
- MEDIUM（中等，分數3-4）：有潛在危險但尚可通行，建議近期處理
- LOW（輕微，分數1-2）：美觀或輕微不便，可排程處理
`;
}

/**
 * 主要分析函式
 * @param {Object} params
 * @param {string} params.imageBase64 - 圖片的 Base64 字串（不含 data:image/... 前綴）
 * @param {string} params.mimeType    - 圖片 MIME 類型，例如 "image/jpeg"
 * @param {string} params.userDescription - 使用者輸入的文字描述
 * @returns {Promise<Object>} 分析結果 JSON
 */
export async function analyzeReport({ imageBase64, mimeType, userDescription }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("缺少 GEMINI_API_KEY 環境變數");

  const requestBody = {
    contents: [
      {
        parts: [
          // 圖片 part（若無圖片則略過）
          ...(imageBase64
            ? [
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: imageBase64,
                  },
                },
              ]
            : []),
          // 文字 prompt part
          {
            text: buildPrompt(userDescription),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,      // 低溫確保輸出穩定
      topP: 0.8,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API 請求失敗 (${response.status}): ${errText}`);
  }

  const data = await response.json();

  // 取得回應文字
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Gemini 未回傳有效內容");

  // 解析 JSON
  return parseGeminiResponse(rawText);
}

/**
 * 解析 Gemini 回傳的 JSON 字串
 * 處理可能包含 ```json ``` 的情況
 */
function parseGeminiResponse(rawText) {
  try {
    // 清除可能的 markdown 代碼框
    const cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // 驗證必要欄位
    const required = ["category", "severity", "summary", "detail"];
    for (const field of required) {
      if (!parsed[field]) {
        throw new Error(`回應缺少必要欄位: ${field}`);
      }
    }

    // 附加 severity 顏色資訊（供前端使用）
    parsed.severity_color = SEVERITY[parsed.severity]?.color || "#757575";
    parsed.severity_level = SEVERITY[parsed.severity]?.level || 0;

    // 附加 timestamp
    parsed.analyzed_at = new Date().toISOString();

    return parsed;
  } catch (err) {
    throw new Error(`JSON 解析失敗: ${err.message}\n原始回應: ${rawText}`);
  }
}

/**
 * 純文字分析（無圖片，僅憑文字描述）
 * 信心度會較低
 */
export async function analyzeTextOnly(userDescription) {
  return analyzeReport({
    imageBase64: null,
    mimeType: null,
    userDescription,
  });
}
