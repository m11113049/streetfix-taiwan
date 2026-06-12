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
    const response = await fetch("/api/ai/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log("AI 回傳結果：", data);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "AI 分析失敗");
    }

    return {
      category: data.data?.category || fallbackCategory,
      severity: data.data?.severity || fallbackSeverity,
      aiSummary: data.data?.ai_summary || "",
      aiSuggestedAction: data.data?.ai_suggested_action || "",
    };
  } catch (error) {
    console.warn("AI 分析失敗，改用手動欄位：", error);

    return {
      category: fallbackCategory,
      severity: fallbackSeverity,
      aiSummary: "",
      aiSuggestedAction: "",
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