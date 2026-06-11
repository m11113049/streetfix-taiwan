export const REPORT_CATEGORIES = [
  "道路坑洞",
  "人行道破損",
  "路燈故障",
  "垃圾堆積",
  "排水異常",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
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
  category: ReportCategory;
  severity: Severity;
  status: ReportStatus;
  createdAt: string;
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

const mockReports: AdminReport[] = [
  {
    id: "1",
    title: "中山路大型坑洞",
    description: "中山路與中正路交叉口出現約 30 公分深坑洞，車輛經過易打滑，需盡快修補。",
    imageUrl: "https://images.unsplash.com/photo-1581094794359-1f0e8e2c8c2b?w=800&q=80",
    location: { lat: 24.801, lng: 120.971 },
    category: "道路坑洞",
    severity: "high",
    status: "pending",
    createdAt: "2026-06-10T08:30:00.000Z",
  },
  {
    id: "2",
    title: "公園路人行道磚塊翹起",
    description: "公園路 120 號前人行道有多處磚塊鬆動翹起，行人容易絆倒。",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    location: { lat: 24.812, lng: 120.965 },
    category: "人行道破損",
    severity: "medium",
    status: "in_progress",
    createdAt: "2026-06-09T14:15:00.000Z",
  },
  {
    id: "3",
    title: "民族路路燈不亮",
    description: "民族路 88 巷口路燈已連續三晚未亮，夜間視線不佳。",
    imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80",
    location: { lat: 24.795, lng: 120.982 },
    category: "路燈故障",
    severity: "medium",
    status: "pending",
    createdAt: "2026-06-08T19:45:00.000Z",
  },
  {
    id: "4",
    title: "市場旁垃圾堆積",
    description: "傳統市場後門垃圾已堆積兩天未清，有異味且影響環境衛生。",
    imageUrl: "https://images.unsplash.com/photo-1530587192110-7b9c883c8c0a?w=800&q=80",
    location: { lat: 24.808, lng: 120.958 },
    category: "垃圾堆積",
    severity: "low",
    status: "completed",
    createdAt: "2026-06-07T11:20:00.000Z",
  },
  {
    id: "5",
    title: "排水溝堵塞積水",
    description: "大雨後光復路排水溝堵塞，路面積水約 10 公分深，機車難以通行。",
    imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80",
    location: { lat: 24.799, lng: 120.975 },
    category: "排水異常",
    severity: "high",
    status: "in_progress",
    createdAt: "2026-06-06T16:00:00.000Z",
  },
  {
    id: "6",
    title: "學校旁小型坑洞",
    description: "學校正門前道路有小型坑洞，建議趁假期修補。",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
    location: { lat: 24.805, lng: 120.968 },
    category: "道路坑洞",
    severity: "low",
    status: "completed",
    createdAt: "2026-06-05T09:10:00.000Z",
  },
];

export async function fetchReports(): Promise<AdminReport[]> {
  // TODO: 組員四串接 Supabase
  return mockReports;
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};
