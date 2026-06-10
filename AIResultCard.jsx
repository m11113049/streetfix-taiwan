/**
 * AIResultCard — React 元件
 *
 * 顯示 AI 分析結果的卡片元件
 * 組員一（前端）可直接引入此元件放在通報表單下方
 *
 * Props:
 *   result  — useAIAnalysis hook 回傳的 result 物件
 *   loading — boolean，分析中時顯示骨架動畫
 *   error   — string | null，錯誤訊息
 */

"use client";

import React from "react";

const SEVERITY_CONFIG = {
  LOW:      { bg: "#E8F5E9", border: "#4CAF50", text: "#1B5E20", icon: "🟢" },
  MEDIUM:   { bg: "#FFF8E1", border: "#FF9800", text: "#E65100", icon: "🟡" },
  HIGH:     { bg: "#FBE9E7", border: "#F44336", text: "#B71C1C", icon: "🔴" },
  CRITICAL: { bg: "#F3E5F5", border: "#9C27B0", text: "#4A148C", icon: "🚨" },
};

export default function AIResultCard({ result, loading, error }) {
  // ── Loading 狀態 ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.loadingHeader}>
          <span style={styles.spinner}>⏳</span>
          <span style={{ marginLeft: 8 }}>AI 分析中，請稍候...</span>
        </div>
        {/* 骨架動畫 */}
        <div style={{ ...styles.skeleton, width: "60%", marginBottom: 8 }} />
        <div style={{ ...styles.skeleton, width: "90%", marginBottom: 8 }} />
        <div style={{ ...styles.skeleton, width: "75%" }} />
      </div>
    );
  }

  // ── 錯誤狀態 ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ ...styles.card, borderColor: "#F44336", background: "#FFF5F5" }}>
        <p style={{ color: "#B71C1C", margin: 0 }}>❌ 分析失敗：{error}</p>
        <p style={{ color: "#888", fontSize: 13, margin: "4px 0 0" }}>
          請確認網路連線，或稍後再試
        </p>
      </div>
    );
  }

  // ── 無結果 ────────────────────────────────────────────────────────────────
  if (!result) return null;

  const sev = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.MEDIUM;

  return (
    <div style={{ ...styles.card, borderColor: sev.border, background: sev.bg }}>
      {/* 標頭列 */}
      <div style={styles.headerRow}>
        <span style={styles.icon}>{sev.icon}</span>
        <div>
          <div style={{ ...styles.severityBadge, background: sev.border, color: "#fff" }}>
            {result.severity_label} (嚴重度 {result.severity_score}/10)
          </div>
          <div style={{ ...styles.categoryTag, color: sev.text }}>
            📋 {result.category}
          </div>
        </div>
        {result.confidence !== undefined && (
          <div style={styles.confidence}>
            信心度 {Math.round(result.confidence * 100)}%
          </div>
        )}
      </div>

      {/* 摘要 */}
      <h3 style={{ ...styles.summary, color: sev.text }}>{result.summary}</h3>

      {/* 詳細描述 */}
      <p style={styles.detail}>{result.detail}</p>

      {/* 建議處理 */}
      <div style={styles.section}>
        <span style={styles.sectionLabel}>🔧 建議處理方式</span>
        <p style={styles.sectionText}>{result.suggested_action}</p>
      </div>

      {/* 判斷原因 */}
      <div style={styles.section}>
        <span style={styles.sectionLabel}>📊 嚴重程度判斷原因</span>
        <p style={styles.sectionText}>{result.urgency_reason}</p>
      </div>

      {/* 標籤 */}
      {result.tags && result.tags.length > 0 && (
        <div style={styles.tagRow}>
          {result.tags.map((tag) => (
            <span key={tag} style={{ ...styles.tag, borderColor: sev.border, color: sev.text }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 分析時間 */}
      {result.analyzed_at && (
        <div style={styles.timestamp}>
          分析時間：{new Date(result.analyzed_at).toLocaleString("zh-TW")}
        </div>
      )}
    </div>
  );
}

// ── Inline Styles ─────────────────────────────────────────────────────────────
const styles = {
  card: {
    border: "2px solid #ccc",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    fontFamily: "system-ui, sans-serif",
    transition: "all 0.3s ease",
  },
  loadingHeader: {
    display: "flex",
    alignItems: "center",
    fontSize: 16,
    color: "#555",
    marginBottom: 12,
  },
  spinner: { fontSize: 20, animation: "spin 1s linear infinite" },
  skeleton: {
    height: 16,
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    borderRadius: 4,
    animation: "shimmer 1.5s infinite",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  icon: { fontSize: 32 },
  severityBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 4,
  },
  categoryTag: {
    fontSize: 14,
    fontWeight: 600,
  },
  confidence: {
    marginLeft: "auto",
    fontSize: 12,
    color: "#666",
    whiteSpace: "nowrap",
  },
  summary: {
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 8px",
  },
  detail: {
    fontSize: 14,
    color: "#444",
    lineHeight: 1.6,
    margin: "0 0 12px",
  },
  section: { marginBottom: 10 },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: "#333" },
  sectionText: { fontSize: 13, color: "#555", margin: "4px 0 0", lineHeight: 1.6 },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tag: {
    border: "1px solid",
    borderRadius: 4,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 600,
  },
  timestamp: {
    marginTop: 12,
    fontSize: 11,
    color: "#999",
    textAlign: "right",
  },
};
