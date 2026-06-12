export type Location = {
  lat: number;
  lng: number;
};

export type Severity = "low" | "medium" | "high";

export type AiAnalyzeResult = {
  category: string;
  severity: Severity;
  aiSummary: string;
  aiSuggestedAction: string;
};

export type ReportPayload = {
  title: string;
  description: string;
  category: string;
  severity?: Severity;
  imageFile?: File | null;
  location: Location;
};

export async function analyzeImage(
  file: File | null,
  description: string,
  fallbackCategory: string,
  fallbackSeverity: Severity = "medium"
): Promise<AiAnalyzeResult> {
  const formData = new FormData();

  formData.append("description", description);

  if (file) {
    formData.append("image", file);
  }

  try {
    const response = await fetch(
      "https://streetfix-taiwan-phfq.vercel.app/api/ai/analyze",
      {
        method: "POST",
        body: formData,
      }
    );

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    console.log("AI 回傳結果：", data);

    // AI API 失敗時，不中斷流程，直接改用手動欄位
    if (!response.ok || !data?.success) {
      console.warn(
        "AI 分析失敗，改用手動欄位：",
        data?.error || data?.message || `HTTP ${response.status}`
      );

      return {
        category: fallbackCategory,
        severity: fallbackSeverity,
        aiSummary: "AI 分析暫時失敗，已改用使用者手動填寫內容。",
        aiSuggestedAction: "建議由相關單位派員確認。",
      };
    }

    const aiData = data.data ?? data;

    return {
      category: aiData.category || fallbackCategory,
      severity: aiData.severity || fallbackSeverity,
      aiSummary:
        aiData.ai_summary ||
        aiData.aiSummary ||
        aiData.summary ||
        "AI 已完成分析，但未產生摘要。",
      aiSuggestedAction:
        aiData.ai_suggested_action ||
        aiData.aiSuggestedAction ||
        aiData.action ||
        "建議由相關單位派員確認。",
    };
  } catch (error) {
    console.warn("AI API 發生連線錯誤，改用手動欄位。");

    return {
      category: fallbackCategory,
      severity: fallbackSeverity,
      aiSummary: "AI 分析暫時失敗，已改用使用者手動填寫內容。",
      aiSuggestedAction: "建議由相關單位派員確認。",
    };
  }
}

export async function submitReport(
  
  payload: ReportPayload & {
    aiSummary?: string;
    aiSuggestedAction?: string;
  }
): Promise<{ success: boolean }> {
  
  console.log("submitReport payload:", payload);
  const formData = new FormData();


  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("category", payload.category);
  formData.append("severity", payload.severity ?? "medium");
  formData.append("latitude", String(payload.location.lat));
  formData.append("longitude", String(payload.location.lng));
  formData.append("aiSummary", payload.aiSummary ?? "");
  formData.append("aiSuggestedAction", payload.aiSuggestedAction ?? "");

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  const response = await fetch("http://localhost:5000/api/reports", {
  method: "POST",
  body: formData,
});

  const data = await response.json();

  console.log("後端回傳：", data);

  if (!response.ok) {
    throw new Error(data.message || "通報送出失敗");
  }

  return { success: true };
}