import { analyzeReport, analyzeTextOnly } from "../../../../lib/analyzeReport";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

    // 新增：讀取前端下拉選單選到的分類
    const selectedCategory = formData.get("category") || "";

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

    // 重要：使用者手動選的分類優先，不讓 AI 覆蓋成「其他」
    result.category = selectedCategory || result.category || "其他";

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