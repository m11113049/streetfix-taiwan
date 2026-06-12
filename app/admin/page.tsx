"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  REPORT_CATEGORIES,
  fetchReports,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  STATUS_LABELS,
  type AdminReport,
  type ReportStatus,
  type Severity,
} from "@/lib/admin";

const categoryStyles: Record<string, string> = {
  道路破損: "bg-red-100 text-red-800 ring-red-200",
  道路坑洞: "bg-red-100 text-red-800 ring-red-200",
  人行道破損: "bg-orange-100 text-orange-800 ring-orange-200",
  路燈故障: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  垃圾堆積: "bg-green-100 text-green-800 ring-green-200",
  排水異常: "bg-blue-100 text-blue-800 ring-blue-200",
  交通號誌異常: "bg-purple-100 text-purple-800 ring-purple-200",
  其他: "bg-slate-100 text-slate-800 ring-slate-200",
};

const statusStyles: Record<ReportStatus, string> = {
  pending: "bg-red-100 text-red-700",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-700",
};

const severityStyles: Record<Severity, string> = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-teal-50 text-teal-700",
};

function AIInfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        borderBottom: isLast ? "none" : "1px solid #ccfbf1",
        padding: "8px 10px",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "96px",
          flexShrink: 0,
          fontWeight: 700,
          color: "#0f766e",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>

      <div
        style={{
          flex: 1,
          color: "#111827",
          lineHeight: 1.6,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [search, setSearch] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadReports() {
    setLoading(true);
    const data = await fetchReports();

    console.log("後台 fetchReports 回傳資料：", data);

    setReports(data);
    setLoading(false);
  }

  loadReports();
}, []);

  const groupedReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const result: Record<string, AdminReport[]> = {};

    REPORT_CATEGORIES.forEach((category) => {
      result[category] = [];
    });

    reports.forEach((report) => {
      const matchSearch =
        !keyword ||
        report.title.toLowerCase().includes(keyword) ||
        report.description.toLowerCase().includes(keyword) ||
        report.ai_summary.toLowerCase().includes(keyword);

      if (!matchSearch) return;

      const category = REPORT_CATEGORIES.includes(report.category as any)
        ? report.category
        : "其他";

      if (!result[category]) {
        result[category] = [];
      }

      result[category].push(report);
    });

    Object.keys(result).forEach((category) => {
      result[category].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
      );
    });

    return result;
  }, [reports, search]);

  const totalCount = useMemo(() => {
    return Object.values(groupedReports).reduce(
      (sum, list) => sum + list.length,
      0,
    );
  }, [groupedReports]);

  const selectedReports = expandedCategory
    ? groupedReports[expandedCategory] || []
    : [];

  return (
    <main className="min-h-screen bg-[#f4fbfa] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-teal-800 underline underline-offset-4"
          >
            回到首頁
          </Link>

          <h1 className="mt-3 text-3xl font-bold text-teal-900">
            後台管理介面
          </h1>

          <p className="mt-2 text-sm text-teal-700">
            依類別集中管理通報案件，展開分類後查看詳細通報
          </p>
        </header>

        <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
          <label
            htmlFor="search"
            className="mb-2 block text-sm font-semibold text-teal-900"
          >
            關鍵字搜尋
          </label>

          <input
            id="search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setExpandedReportId(null);
            }}
            placeholder="搜尋標題、描述或 AI 摘要..."
            className="h-11 w-full rounded-xl border border-teal-200 px-4 text-sm outline-none ring-teal-400 focus:ring-2"
          />

          <p className="mt-3 text-sm text-teal-700">
            目前共 {totalCount} 筆通報
          </p>
        </section>

        {loading ? (
          <p className="rounded-2xl bg-white p-6 text-center text-teal-700 shadow-sm">
            資料載入中...
          </p>
        ) : (
          <>
            <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {REPORT_CATEGORIES.map((category) => {
                const categoryReports = groupedReports[category] || [];
                const isActive = expandedCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => {
                      setExpandedCategory(isActive ? null : category);
                      setExpandedReportId(null);
                    }}
                    className={`rounded-2xl p-4 text-left shadow-sm ring-1 transition hover:scale-[1.02] ${
                      categoryStyles[category] ||
                      "bg-white text-teal-900 ring-teal-100"
                    } ${isActive ? "scale-[1.02] ring-2" : ""}`}
                  >
                    <p className="text-sm font-bold">{category}</p>

                    <p className="mt-2 text-2xl font-black">
                      {categoryReports.length}
                    </p>

                    <p className="mt-1 text-xs font-medium">
                      {isActive ? "已展開 ▲" : "點擊查看 ▼"}
                    </p>
                  </button>
                );
              })}
            </section>

            {!expandedCategory ? (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-teal-700 shadow-sm">
                請點選上方分類查看通報案件
              </p>
            ) : (
              <section className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-teal-900">
                      {expandedCategory}
                    </h2>

                    <p className="text-sm text-teal-700">
                      共 {selectedReports.length} 筆通報
                    </p>
                  </div>
                </div>

                {selectedReports.length === 0 ? (
                  <p className="rounded-xl bg-teal-50 p-5 text-center text-sm text-teal-700">
                    目前沒有此類別通報
                  </p>
                ) : (
                  <ul className="divide-y divide-teal-100">
                    {selectedReports.map((report) => {
                      const isReportExpanded = expandedReportId === report.id;

                      return (
                        <li key={report.id} className="py-2">
                          <button
                            onClick={() =>
                              setExpandedReportId(
                                isReportExpanded ? null : report.id,
                              )
                            }
                            className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left hover:bg-teal-50"
                          >
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-teal-900">
                                {report.title}
                              </h3>

                              <div className="mt-2 space-y-1 text-xs text-teal-700">
                                <p>
                                  <span className="font-semibold">
                                    嚴重程度：
                                  </span>
                                  <span
                                    className={`ml-1 rounded-full px-2 py-0.5 font-medium ${
                                      severityStyles[report.severity]
                                    }`}
                                  >
                                    {SEVERITY_LABELS[report.severity]}
                                  </span>
                                </p>

                                <p>
                                  <span className="font-semibold">進度：</span>
                                  <span
                                    className={`ml-1 rounded-full px-2 py-0.5 font-medium ${
                                      statusStyles[report.status]
                                    }`}
                                  >
                                    {STATUS_LABELS[report.status]}
                                  </span>
                                </p>

                                <p>
                                  <span className="font-semibold">位置：</span>
                                  緯度 {report.location.lat.toFixed(4)} / 經度{" "}
                                  {report.location.lng.toFixed(4)}
                                </p>
                              </div>
                            </div>

                            <span className="shrink-0 text-xs font-semibold text-teal-700">
                              {isReportExpanded ? "收合 ▲" : "詳情 ▼"}
                            </span>
                          </button>

                          {isReportExpanded && (
                            <div className="mx-3 mb-3 rounded-xl bg-teal-50 p-4">
                              <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                                {report.imageUrl ? (
                                  <img
                                    src={report.imageUrl}
                                    alt={report.title}
                                    className="h-24 w-full rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="flex h-24 items-center justify-center rounded-lg bg-white text-xs text-teal-700">
                                    無圖片
                                  </div>
                                )}

                                <div className="space-y-3 text-sm text-teal-800">
                                  <div
                                    style={{
                                      backgroundColor: "#ffffff",
                                      borderRadius: "10px",
                                      padding: "12px",
                                      color: "#111827",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: "#0f766e",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      通報描述
                                    </div>

                                    <div
                                      style={{
                                        fontSize: "14px",
                                        lineHeight: 1.6,
                                        color: "#111827",
                                      }}
                                    >
                                      {report.description || "無補充描述"}
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      backgroundColor: "#ffffff",
                                      borderRadius: "10px",
                                      padding: "12px",
                                      fontSize: "14px",
                                      color: "#0f766e",
                                    }}
                                  >
                                    <h4
                                      style={{
                                        marginBottom: "10px",
                                        fontSize: "15px",
                                        fontWeight: 700,
                                        color: "#134e4a",
                                      }}
                                    >
                                      AI 輔助分析結果
                                    </h4>

                                    <div
                                      style={{
                                        border: "1px solid #ccfbf1",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        backgroundColor: "#ffffff",
                                      }}
                                    >
                                      <AIInfoRow
                                        label="問題摘要"
                                        value={
                                          report.ai_summary ||
                                          "尚未產生 AI 摘要"
                                        }
                                      />

                                      <AIInfoRow
                                        label="處置方式"
                                        value={
                                          report.ai_suggested_action ||
                                          "尚未產生建議處置"
                                        }
                                      />

                                      <AIInfoRow
                                        label="優先度"
                                        value={`${SEVERITY_LABELS[report.severity]}（${report.severity}）`}
                                      />

                                      <AIInfoRow
                                        label="案件狀態"
                                        value={STATUS_LABELS[report.status]}
                                      />

                                      
                                    </div>
                                  </div>

                                  {report.ai_tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {report.ai_tags.map((tag) => (
                                        <span
                                          key={tag}
                                          className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-700"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}