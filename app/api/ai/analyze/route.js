import { analyzeReport, analyzeTextOnly } from "../../../../lib/analyzeReport";

// CORS：允許其他網域(前端/整合組部署網址)呼叫這支 API
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// 處理瀏覽器的 CORS 預檢請求 (preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");
    const description = formData.get("description") || "";

    if (!imageFile && !description.trim()) {
      return Response.json(
        { success: false, error: "請提供圖片或文字描述" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    let result;

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = imageFile.type || "image/jpeg";

      result = await analyzeReport({
        imageBase64: base64,
        mimeType,
        userDescription: description,
      });
    } else {
      result = await analyzeTextOnly(description);
    }

    return Response.json(
      {
        success: true,
        data: result,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (err) {
    console.error("[AI Route Error]", err.message);

    return Response.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
