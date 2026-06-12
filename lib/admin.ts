function normalizeCategory(category: string): string {
  const value = String(category || "").trim();

  if (value.includes("人行道")) return "人行道破損";
  if (value.includes("路燈")) return "路燈故障";
  if (value.includes("垃圾")) return "垃圾堆積";
  if (value.includes("排水") || value.includes("積水") || value.includes("水溝")) {
    return "排水異常";
  }
  if (value.includes("號誌") || value.includes("紅綠燈") || value.includes("交通燈")) {
    return "交通號誌異常";
  }
  if (value.includes("坑洞") || value.includes("道路") || value.includes("路面")) {
    return "道路破損";
  }

  return "其他";
}

export const REPORT_CATEGORIES = [
  "道路破損",
  "人行道破損",
  "路燈故障",
  "垃圾堆積",
  "排水異常",
  "交通號誌異常",
  "其他",
] as const;

export type Severity = "high" | "medium" | "low";
export type ReportStatus = "pending" | "in_progress" | "completed";

export type Location = {
  lat: number;
  lng: number;
};

export type AdminReport = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: Location;
  category: string;
  severity: Severity;
  status: ReportStatus;
  createdAt: string;
  ai_summary: string;
  ai_suggested_action: string;
  ai_tags: string[];
  ai_confidence: number;
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "待處理",
  in_progress: "處理中",
  completed: "已完成",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export async function fetchReports(): Promise<AdminReport[]> {
  try {
    const response = await fetch("http://localhost:5000/api/reports");

    if (!response.ok) {
      throw new Error("無法取得通報資料");
    }

    const result = await response.json();

    const reports = Array.isArray(result)
      ? result
      : result.data || result.reports || [];

    return reports.map((report: any) => {
      const rawCategory =
        report.category ||
        report.ai_category ||
        report.aiCategory ||
        report.analysis?.category ||
        report.analysis?.ai_category ||
        report.aiResult?.category ||
        report.aiResult?.ai_category ||
        report.result?.category ||
        report.result?.ai_category ||
        "其他";

      const rawSeverity =
        report.severity ||
        report.ai_severity ||
        report.aiSeverity ||
        report.analysis?.severity ||
        report.analysis?.ai_severity ||
        report.aiResult?.severity ||
        report.aiResult?.ai_severity ||
        report.result?.severity ||
        report.result?.ai_severity ||
        "medium";

      const rawStatus =
        report.status ||
        report.case_status ||
        report.caseStatus ||
        report.analysis?.status ||
        report.aiResult?.status ||
        report.result?.status ||
        "pending";

      const rawConfidence =
        report.ai_confidence ??
        report.aiConfidence ??
        report.confidence ??
        report.analysis?.ai_confidence ??
        report.analysis?.aiConfidence ??
        report.analysis?.confidence ??
        report.aiResult?.ai_confidence ??
        report.aiResult?.aiConfidence ??
        report.aiResult?.confidence ??
        report.result?.ai_confidence ??
        report.result?.aiConfidence ??
        report.result?.confidence ??
        0;

      let aiConfidence = Number(rawConfidence);

      if (!Number.isFinite(aiConfidence)) {
        aiConfidence = 0;
      }

      if (aiConfidence > 1) {
        aiConfidence = aiConfidence / 100;
      }

      aiConfidence = Math.max(0, Math.min(1, aiConfidence));

      return {
        id: report.id || crypto.randomUUID(),
        title: report.title || rawCategory || "未命名通報",
        description: report.description || "",
        imageUrl: report.imageUrl || report.image || "",
        location: {
          lat: Number(report.latitude ?? report.location?.lat ?? 0),
          lng: Number(report.longitude ?? report.location?.lng ?? 0),
        },
        category: normalizeCategory(rawCategory),
        severity:
          rawSeverity === "high" || rawSeverity === "medium" || rawSeverity === "low"
            ? rawSeverity
            : "medium",
        status:
          rawStatus === "pending" ||
          rawStatus === "in_progress" ||
          rawStatus === "completed"
            ? rawStatus
            : "pending",
        createdAt: report.createdAt || new Date().toISOString(),
        ai_summary:
          report.ai_summary ||
          report.aiSummary ||
          report.summary ||
          report.analysis?.ai_summary ||
          report.analysis?.summary ||
          report.aiResult?.ai_summary ||
          report.aiResult?.summary ||
          report.result?.ai_summary ||
          report.result?.summary ||
          "尚未產生 AI 摘要",
        ai_suggested_action:
          report.ai_suggested_action ||
          report.aiSuggestedAction ||
          report.suggested_action ||
          report.action ||
          report.analysis?.ai_suggested_action ||
          report.analysis?.suggested_action ||
          report.analysis?.action ||
          report.aiResult?.ai_suggested_action ||
          report.aiResult?.suggested_action ||
          report.aiResult?.action ||
          report.result?.ai_suggested_action ||
          report.result?.suggested_action ||
          report.result?.action ||
          "尚未產生建議處置",
        ai_tags:
          report.ai_tags ||
          report.aiTags ||
          report.tags ||
          report.analysis?.ai_tags ||
          report.analysis?.tags ||
          report.aiResult?.ai_tags ||
          report.aiResult?.tags ||
          report.result?.ai_tags ||
          report.result?.tags ||
          [],
        ai_confidence: aiConfidence,
      };
    });
  } catch (error) {
    console.error("取得通報資料失敗:", error);
    return [];
  }
}