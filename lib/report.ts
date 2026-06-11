export type Location = {
  lat: number;
  lng: number;
};

export type ReportPayload = {
  title: string;
  description: string;
  imageUrl: string;
  location: Location;
};

export async function analyzeImage(file: File | null): Promise<{ labels: string[] }> {
  // TODO: 組員三負責串接 AI 影像分析流程與模型推論
  if (!file) {
    return { labels: [] };
  }

  return { labels: ["待 AI 分析"] };
}

export async function submitReport(payload: ReportPayload): Promise<{ success: boolean }> {
  // TODO: 組員四負責串接 Supabase API 與資料寫入流程
  console.log("submitReport payload:", payload);
  return { success: true };
}
