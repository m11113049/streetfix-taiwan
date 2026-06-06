/**
 * Next.js API Route: /api/ai/analyze
 * 
 * 此檔案放在 Next.js 專案的 pages/api/ai/analyze.js 或 app/api/ai/analyze/route.js
 * 
 * 提供給前端呼叫的 REST 端點
 * 同時也供後端整合組（組員四）在整合時使用
 *
 * POST /api/ai/analyze
 * Body: FormData
 *   - image: File（可選）
 *   - description: string（可選）
 *   - reportId: string（可選，用於追蹤）
 *
 * Response: JSON（analyzeReport 的回傳結果）
 */

import { analyzeReport, analyzeTextOnly } from "../../lib/analyzeReport";

// ─── Next.js App Router 版本 (app/api/ai/analyze/route.js) ────────────────────
export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");     // File 或 null
    const description = formData.get("description") || "";
    const reportId = formData.get("reportId") || "unknown";

    console.log(`[AI] 收到分析請求 reportId=${reportId}, hasImage=${!!imageFile}`);

    let result;

    if (imageFile && imageFile.size > 0) {
      // 有圖片：轉 Base64 後送 Gemini
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const mimeType = imageFile.type || "image/jpeg";

      result = await analyzeReport({ imageBase64: base64, mimeType, userDescription: description });
    } else if (description.trim()) {
      // 無圖片，純文字分析
      result = await analyzeTextOnly(description);
    } else {
      return Response.json(
        { success: false, error: "請提供圖片或文字描述" },
        { status: 400 }
      );
    }

    console.log(`[AI] 分析完成 category=${result.category} severity=${result.severity}`);

    return Response.json({
      success: true,
      reportId,
      data: result,
    });
  } catch (err) {
    console.error("[AI] 分析錯誤:", err.message);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ─── Next.js Pages Router 版本 (pages/api/ai/analyze.js) ─────────────────────
// 如果專案使用 Pages Router，請改用以下版本：
/*
import formidable from "formidable";
import fs from "fs";
import { analyzeReport, analyzeTextOnly } from "../../../lib/analyzeReport";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "表單解析失敗" });

    try {
      const description = fields.description?.[0] || "";
      const imageFile = files.image?.[0];

      let result;
      if (imageFile) {
        const buffer = fs.readFileSync(imageFile.filepath);
        const base64 = buffer.toString("base64");
        result = await analyzeReport({ imageBase64: base64, mimeType: imageFile.mimetype, userDescription: description });
      } else {
        result = await analyzeTextOnly(description);
      }

      res.status(200).json({ success: true, data: result });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
}
*/
