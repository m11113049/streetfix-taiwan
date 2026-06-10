/**
 * Next.js API Route — /api/ai/analyze
 * 放置位置：app/api/ai/analyze/route.js
 *
 * 接收前端 FormData，呼叫 Gemini，回傳對齊後端格式的 JSON
 * POST body: FormData
 *   - image: File（可選）
 *   - description: string（可選）
 */

import { analyzeReport, analyzeTextOnly } from "../../../../lib/analyzeReport";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile  = formData.get("image");
    const description = formData.get("description") || "";

    if (!imageFile && !description.trim()) {
      return Response.json({ success: false, error: "請提供圖片或文字描述" }, { status: 400 });
    }

    let result;

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = imageFile.type || "image/jpeg";
      result = await analyzeReport({ imageBase64: base64, mimeType, userDescription: description });
    } else {
      result = await analyzeTextOnly(description);
    }

    return Response.json({ success: true, data: result });
  } catch (err) {
    console.error("[AI Route Error]", err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
