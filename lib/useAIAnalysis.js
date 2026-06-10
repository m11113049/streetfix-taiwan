/**
 * useAIAnalysis — React Hook
 * 放置位置：lib/useAIAnalysis.js
 *
 * 給前端組員一使用，封裝所有 AI 分析邏輯
 *
 * 使用範例：
 *   const { analyze, result, loading, error, progress, reset } = useAIAnalysis()
 *   await analyze({ file: imageFile, description: "路上有坑洞", location: { lat, lng } })
 *
 * result 即為可直接 POST 到 /api/reports 的完整資料（含 AI 分析結果）
 */

"use client";

import { useState, useCallback } from "react";

export function useAIAnalysis() {
  const [result, setResult] = useState(null);   // 完整的後端格式 JSON
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");

  /**
   * @param {Object} params
   * @param {File}   params.file        圖片 File 物件（可選）
   * @param {string} params.description 文字描述（可選）
   * @param {Object} params.location    { lat, lng }（由地圖組提供，可選）
   */
  const analyze = useCallback(async ({ file, description, location }) => {
    if (!file && !description?.trim()) {
      setError("請至少上傳圖片或輸入描述");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setProgress("準備圖片中...");
      const formData = new FormData();
      if (file) formData.append("image", file);
      if (description) formData.append("description", description);

      setProgress("AI 分析中，請稍候...");
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();
      if (!json.success) throw new Error(json.error || "AI 分析失敗");

      // 把地圖組提供的 GPS 座標填入
      const data = { ...json.data };
      if (location?.lat && location?.lng) {
        data.location = { lat: location.lat, lng: location.lng };
      }

      setResult(data);
      setProgress("分析完成！");
    } catch (err) {
      setError(err.message);
      setProgress("");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress("");
    setLoading(false);
  }, []);

  return { analyze, result, loading, error, progress, reset };
}
