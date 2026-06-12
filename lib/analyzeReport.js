/**
 * StreetFix Taiwan — AI 分析核心模組
 * 組員三負責：Gemini API 串接、圖片分析、問題分類、摘要生成、嚴重程度判斷
 *
 * 放置位置：lib/analyzeReport.js
 */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ── 與全組統一的 category 固定值 ──────────────────────────────────────────
export const CATEGORIES = [
  "道路破損",
  "路燈故障",
  "垃圾堆積",
  "排水異常",
  "人行道破損",
  "交通號誌異常",
  "其他",
];

// ── 與全組統一的 severity 固定值 ──────────────────────────────────────────
export const SEVERITY_VALUES = ["low", "medium", "high"];

/**
 * Prompt：明確告知 Gemini 只能輸出固定值
 */
function buildPrompt(userDescription) {
  return `你是台灣城市公共設施通報系統的 AI 分析助手。
請根據照片（若有）與描述，輸出符合後端格式的 JSON，不加任何額外文字或 markdown。

使用者描述：「${userDescription || "（無描述）"}」

請嚴格輸出以下格式（欄位值只能使用括號內的固定選項）：
{
  "title": "15字以內的問題標題（繁體中文）",
  "category": "道路破損 | 路燈故障 | 垃圾堆積 | 排水異常 | 人行道破損 | 交通號誌異常 | 其他",
  "severity": "low | medium | high",
  "ai_summary": "30字以內的問題摘要（繁體中文）",
  "ai_suggested_action": "建議處理方式（繁體中文，20字以內）",
  "ai_tags": ["標籤1", "標籤2"],
  "ai_confidence": 0到1的浮點數
}

severity 判斷標準（只能選以下三個值）：
- high：影響行車或行人安全，需盡快處理，或有立即危險
- medium：有潛在危險，建議近期處理
- low：輕微問題，可排程處理`;
}

/**
 * 主要分析函式
 * @param {Object} params
 * @param {string} params.imageBase64      Base64 字串（不含 data:image/ 前綴）
 * @param {string} params.mimeType         圖片 MIME，例如 "image/jpeg"
 * @param {string} params.userDescription  使用者輸入的文字描述
 * @returns {Promise<Object>} 對齊全組統一格式的 JSON
 */
export async function analyzeReport({ imageBase64, mimeType, userDescription }) {
    if (process.env.USE_MOCK_AI === "true") {
  const text = userDescription || "";

  let category = "其他";
  let title = "公共設施通報";
  let ai_summary = "偵測到公共設施異常";
  let ai_suggested_action = "派員確認";
  let ai_tags = ["公共設施"];

  if (text.includes("垃圾") || text.includes("清運") || text.includes("髒亂")) {
    category = "垃圾堆積";
    title = "垃圾堆積通報";
    ai_summary = "路邊垃圾影響環境";
    ai_suggested_action = "派員清運";
    ai_tags = ["垃圾", "環境髒亂"];
  } else if (text.includes("坑洞") || text.includes("破洞") || text.includes("道路")) {
    category = "道路破損";
    title = "道路破損通報";
    ai_summary = "道路出現破損情形";
    ai_suggested_action = "安排路面修補";
    ai_tags = ["道路", "路面修繕"];
  } else if (text.includes("人行道") || text.includes("磚塊") || text.includes("行人")) {
    category = "人行道破損";
    title = "人行道破損通報";
    ai_summary = "人行道出現破損";
    ai_suggested_action = "安排人行道修繕";
    ai_tags = ["人行道", "行人安全"];
  } else if (text.includes("路燈") || text.includes("燈不亮") || text.includes("照明")) {
    category = "路燈故障";
    title = "路燈故障通報";
    ai_summary = "路燈故障影響照明";
    ai_suggested_action = "派員檢修路燈";
    ai_tags = ["路燈", "夜間安全"];
  } else if (text.includes("排水") || text.includes("積水") || text.includes("水溝")) {
    category = "排水異常";
    title = "排水異常通報";
    ai_summary = "排水異常造成積水";
    ai_suggested_action = "疏通排水系統";
    ai_tags = ["排水", "積水"];
  } else if (text.includes("號誌") || text.includes("紅綠燈") || text.includes("交通燈")) {
    category = "交通號誌異常";
    title = "交通號誌異常通報";
    ai_summary = "交通號誌運作異常";
    ai_suggested_action = "派員檢查號誌";
    ai_tags = ["交通號誌", "交通安全"];
  }

  return {
    title,
    category,
    severity: "medium",
    ai_summary,
    ai_suggested_action,
    ai_tags,
    ai_confidence: 0.95,
    description: userDescription || "",
    imageUrl: "",
    location: { lat: 0, lng: 0 },
    status: "pending",
    createdAt: null,
  };
}
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("缺少 GEMINI_API_KEY，請在 .env.local 加入");

  const parts = [];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } });
  }
  parts.push({ text: buildPrompt(userDescription) });

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini API 錯誤 (${response.status}): ${err.error?.message || "未知錯誤"}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Gemini 未回傳有效內容");

  return parseAndValidate(rawText, userDescription);
}

/**
 * 解析 + 驗證固定值 + 組裝最終格式
 */
function parseAndValidate(rawText, userDescription) {
  const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  let ai;
  try {
    ai = JSON.parse(cleaned);
  } catch {
    throw new Error(`JSON 解析失敗，原始回應：${rawText}`);
  }

  // ── 驗證 category 必須是固定值 ──────────────────────────────────────────
  if (!CATEGORIES.includes(ai.category)) {
    console.warn(`[AI] 非預期 category「${ai.category}」，自動改為「其他」`);
    ai.category = "其他";
  }

  // ── 驗證 severity 必須是固定值 ──────────────────────────────────────────
  if (!SEVERITY_VALUES.includes(ai.severity)) {
    console.warn(`[AI] 非預期 severity「${ai.severity}」，自動改為「medium」`);
    ai.severity = "medium";
  }

  // ── 組裝全組統一的通報資料格式 ──────────────────────────────────────────
  return {
    // AI 負責的欄位
    title:             ai.title || ai.ai_summary,
    category:          ai.category,
    severity:          ai.severity,
    ai_summary:        ai.ai_summary,
    ai_suggested_action: ai.ai_suggested_action || "",
    ai_tags:           Array.isArray(ai.ai_tags) ? ai.ai_tags : [],
    ai_confidence:     typeof ai.ai_confidence === "number" ? ai.ai_confidence : 0,

    // 前端負責填入的欄位（預設空值，由前端覆蓋）
    description:       userDescription || "",
    imageUrl:          "",
    location:          { lat: 0, lng: 0 },

    // 後端負責的欄位（由後端填入，這裡給預設值）
    status:            "pending",
    createdAt:         null, // Firebase Server Timestamp 由後端填
  };
}

/**
 * 純文字分析（無圖片）
 */
export async function analyzeTextOnly(userDescription) {
  return analyzeReport({ imageBase64: null, mimeType: null, userDescription });
}
