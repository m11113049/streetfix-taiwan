"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  STATUS_LABELS,
  type ReportStatus,
  type Severity,
} from "@/lib/admin";

type AdminReport = {
  title: string;
  description: string;
  category: string;
  severity: Severity;
  imageUrl: string;
  location: { lat: number; lng: number };
  status: ReportStatus;
  ai_summary: string;
  ai_suggested_action: string;
  ai_tags: string[];
  ai_confidence: number;
};

const mockReports: AdminReport[] = [
  {
    title: "中山路大型坑洞",
    description: "中山路與中正路交叉口出現約 30 公分深坑洞，車輛經過易打滑，需盡快修補。",
    category: "道路破損",
    severity: "high",
    imageUrl: "https://images.unsplash.com/photo-1581094794359-1f0e8e2c8c2b?w=800&q=80",
    location: { lat: 24.801, lng: 120.971 },
    status: "pending",
    ai_summary: "偵測到大型坑洞，深度約 30 公分，位於主要車道",
    ai_suggested_action: "立即設置警示並修補",
    ai_tags: ["交通安全", "路面修繕"],
    ai_confidence: 0.92,
  },
  {
    title: "公園路人行道磚塊翹起",
    description: "公園路 120 號前人行道有多處磚塊鬆動翹起，行人容易絆倒。",
    category: "人行道破損",
    severity: "medium",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    location: { lat: 24.812, lng: 120.965 },
    status: "in_progress",
    ai_summary: "人行道磚塊多處翹起，存在絆倒風險",
    ai_suggested_action: "圍蔽危險區域並安排修復",
    ai_tags: ["行人安全", "人行道"],
    ai_confidence: 0.87,
  },
  {
    title: "民族路路燈不亮",
    description: "民族路 88 巷口路燈已連續三晚未亮，夜間視線不佳。",
    category: "路燈故障",
    severity: "medium",
    imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80",
    location: { lat: 24.795, lng: 120.982 },
    status: "pending",
    ai_summary: "路燈故障，夜間照明不足",
    ai_suggested_action: "通報維修單位檢查線路與燈具",
    ai_tags: ["公共照明", "夜間安全"],
    ai_confidence: 0.85,
  },
  {
    title: "市場旁垃圾堆積",
    description: "傳統市場後門垃圾已堆積兩天未清，有異味且影響環境衛生。",
    category: "垃圾堆積",
    severity: "low",
    imageUrl: "https://images.unsplash.com/photo-1530587192110-7b9c883c8c0a?w=800&q=80",
    location: { lat: 24.808, lng: 120.958 },
    status: "completed",
    ai_summary: "垃圾堆積超過 48 小時，影響環境衛生",
    ai_suggested_action: "通知清潔隊加速清運",
    ai_tags: ["環境衛生", "垃圾清運"],
    ai_confidence: 0.79,
  },
  {
    title: "排水溝堵塞積水",
    description: "大雨後光復路排水溝堵塞，路面積水約 10 公分深，機車難以通行。",
    category: "排水異常",
    severity: "high",
    imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80",
    location: { lat: 24.799, lng: 120.975 },
    status: "in_progress",
    ai_summary: "排水溝堵塞導致路面積水，影響交通",
    ai_suggested_action: "立即疏通排水溝並設置臨時導引",
    ai_tags: ["排水系統", "交通安全"],
    ai_confidence: 0.91,
  },
  {
    title: "學校旁小型坑洞",
    description: "學校正門前道路有小型坑洞，建議趁假期修補。",
    category: "道路破損",
    severity: "low",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
    location: { lat: 24.805, lng: 120.968 },
    status: "completed",
    ai_summary: "偵測到小型路面坑洞，範圍有限",
    ai_suggested_action: "排程修補，暫不需緊急處置",
    ai_tags: ["路面修繕", "校園周邊"],
    ai_confidence: 0.74,
  },
];

const statusStyles: Record<ReportStatus, string> = {
  pending: "bg-red-100 text-red-700 ring-red-200",
  in_progress: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  completed: "bg-green-100 text-green-700 ring-green-200",
};

const severityStyles: Record<Severity, string> = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-teal-50 text-teal-700",
};

export default function AdminPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = useMemo(
    () => [...new Set(mockReports.map((report) => report.category))],
    [],
  );

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return mockReports
      .filter((report) => {
        const matchCategory = categoryFilter === "all" || report.category === categoryFilter;
        const matchSearch =
          !keyword ||
          report.title.toLowerCase().includes(keyword) ||
          report.description.toLowerCase().includes(keyword) ||
          report.ai_summary.toLowerCase().includes(keyword);
        return matchCategory && matchSearch;
      })
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [search, categoryFilter]);

  return (
    <main className="min-h-screen bg-[#f4fbfa] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-teal-800 underline underline-offset-4"
          >
            回到首頁
          </Link>
          <span className="mt-4 inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-800">
            StreetFix Taiwan
          </span>
          <h1 className="mt-3 text-2xl font-bold text-teal-900 sm:text-4xl">後台管理介面</h1>
          <p className="mt-2 text-sm text-teal-700 sm:text-base">
            檢視、篩選與整理所有通報案件
          </p>
        </header>

        <section className="mb-6 space-y-4 rounded-2xl bg-white p-4 shadow-md sm:p-6">
          <div>
            <label htmlFor="search" className="mb-2 block text-sm font-semibold text-teal-900">
              關鍵字搜尋
            </label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜尋標題、描述或 AI 摘要..."
              className="min-h-12 w-full rounded-xl border border-teal-200 px-4 py-3 text-base outline-none ring-teal-400 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-semibold text-teal-900">
              類別篩選
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-base outline-none ring-teal-400 focus:ring-2 sm:max-w-sm"
            >
              <option value="all">全部類別</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-teal-700">
            共 {filteredReports.length} 筆通報 · 已依嚴重程度排序（高 → 中 → 低）
          </p>
        </section>

        {filteredReports.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-teal-700 shadow-md">
            找不到符合條件的通報
          </p>
        ) : (
          <ul className="space-y-4">
            {filteredReports.map((report, index) => (
              <li
                key={`${report.title}-${index}`}
                className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row">
                  {report.imageUrl ? (
                    <div className="relative h-48 w-full shrink-0 bg-teal-50 sm:h-auto sm:w-48">
                      <img
                        src={report.imageUrl}
                        alt={report.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="text-lg font-bold text-teal-900 sm:text-xl">
                        {report.title}
                      </h2>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[report.status]}`}
                      >
                        {STATUS_LABELS[report.status]}
                      </span>
                    </div>

                    <p className="text-sm leading-6 text-teal-800 sm:text-base">
                      {report.description}
                    </p>

                    <div className="rounded-xl bg-teal-50 p-3 text-sm text-teal-800">
                      <p className="font-semibold text-teal-900">AI 摘要</p>
                      <p className="mt-1">{report.ai_summary}</p>
                      <p className="mt-2 font-semibold text-teal-900">建議處置</p>
                      <p className="mt-1">{report.ai_suggested_action}</p>
                      <p className="mt-2 text-xs text-teal-700">
                        信心值：{(report.ai_confidence * 100).toFixed(0)}%
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-lg bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800">
                        {report.category}
                      </span>
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-medium ${severityStyles[report.severity]}`}
                      >
                        嚴重程度：{SEVERITY_LABELS[report.severity]}（{report.severity}）
                      </span>
                      {report.ai_tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-teal-700">
                      座標：lat {report.location.lat} / lng {report.location.lng}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
