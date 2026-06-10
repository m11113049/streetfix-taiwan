/**
 * AIResultCard — React 元件
 * 放置位置：components/AIResultCard.jsx
 *
 * 給前端組員一使用，顯示 AI 分析結果卡片
 * severity 只有 low / medium / high 三個值
 *
 * Props:
 *   result  — useAIAnalysis 的 result
 *   loading — boolean
 *   error   — string | null
 */

"use client";

import React from "react";

const SEV_STYLE = {
  low:    { bg: "#E8F5E9", border: "#4CAF50", text: "#2E7D32", label: "輕微 🟢" },
  medium: { bg: "#FFF8E1", border: "#FF9800", text: "#E65100", label: "中等 🟡" },
  high:   { bg: "#FBE9E7", border: "#F44336", text: "#B71C1C", label: "嚴重 🔴" },
};

export default function AIResultCard({ result, loading, error }) {
  if (loading) {
    return (
      <div style={s.card}>
        <p style={{ color: "#888", margin: 0 }}>⏳ AI 分析中，請稍候...</p>
        <div style={{ ...s.skeleton, width: "60%", marginTop: 12 }} />
        <div style={{ ...s.skeleton, width: "90%", marginTop: 8 }} />
        <div style={{ ...s.skeleton, width: "75%", marginTop: 8 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...s.card, borderColor: "#F44336", background: "#FFF5F5" }}>
        <p style={{ color: "#B71C1C", margin: 0 }}>❌ 分析失敗：{error}</p>
      </div>
    );
  }

  if (!result) return null;

  const sev = SEV_STYLE[result.severity] || SEV_STYLE.medium;

  return (
    <div style={{ ...s.card, borderColor: sev.border, background: sev.bg }}>
      {/* 標頭 */}
      <div style={s.row}>
        <div>
          <span style={{ ...s.badge, background: sev.border, color: "#fff" }}>
            {sev.label}
          </span>
          <span style={{ ...s.category, color: sev.text }}> {result.category}</span>
        </div>
        {result.ai_confidence !== undefined && (
          <span style={s.conf}>信心度 {Math.round(result.ai_confidence * 100)}%</span>
        )}
      </div>

      {/* 標題 */}
      <h3 style={{ ...s.title, color: sev.text }}>{result.title}</h3>

      {/* 摘要 */}
      <p style={s.text}>{result.ai_summary}</p>

      {/* 建議處理 */}
      {result.ai_suggested_action && (
        <div style={s.section}>
          <span style={s.sectionLabel}>🔧 建議處理</span>
          <p style={s.text}>{result.ai_suggested_action}</p>
        </div>
      )}

      {/* 標籤 */}
      {result.ai_tags?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {result.ai_tags.map((tag) => (
            <span key={tag} style={{ ...s.tag, borderColor: sev.border, color: sev.text }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  card: { border: "2px solid #ccc", borderRadius: 12, padding: 16, marginTop: 16, fontFamily: "system-ui, sans-serif" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  badge: { display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 13, fontWeight: 700 },
  category: { fontSize: 14, fontWeight: 600 },
  conf: { fontSize: 12, color: "#888" },
  title: { fontSize: 17, fontWeight: 700, margin: "4px 0 8px" },
  text: { fontSize: 14, color: "#444", lineHeight: 1.6, margin: "4px 0" },
  section: { marginTop: 10 },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: "#333" },
  tag: { display: "inline-block", border: "1px solid", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 600, marginRight: 4, marginTop: 4 },
  skeleton: { height: 14, background: "#e0e0e0", borderRadius: 4 },
};
