/**
 * useAIAnalysis — React Hook
 *
 * 前端呼叫 AI 分析 API 的封裝 hook
 * 組員一（前端）可直接引入使用，不需理解 Gemini API 細節
 *
 * 使用範例：
 *   const { analyze, result, loading, error, reset } = useAIAnalysis()
 *   await analyze({
 *     file: imageFile,
 *     description: "路上有大坑洞",
 *     category: "道路破損"
 *   })
 */

"use client";

import { useState, useCallback } from "react";
import { compressAndConvert } from "./imageUtils";

export function useAIAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");

  /**
   * 執行 AI 分析
   * @param {Object} params
   * @param {File}   params.file        - 圖片 File 物件（可選）
   * @param {string} params.description - 文字描述（可選）
   * @param {string} params.category    - 使用者選擇的通報分類
   * @param {string} params.reportId    - 通報單 ID（可選）
   */
  const analyze = useCallback(async ({ file, description, category, reportId }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();

      if (file) {
        setProgress("正在壓縮圖片...");

        try {
          if (typeof document !== "undefined") {
            const { base64, mimeType } = await compressAndConvert(file);

            const byteCharacters = atob(base64);
            const byteArray = new Uint8Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
              byteArray[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([byteArray], { type: mimeType });
            formData.append("image", blob, file.name || "photo.jpg");
          } else {
            formData.append("image", file);
          }
        } catch {
          formData.append("image", file);
        }
      }

      if (description) {
        formData.append("description", description);
      }

      // 重要：把下拉選單選到的分類一起送給 AI API
      if (category) {
        formData.append("category", category);
      }

      if (reportId) {
        formData.append("reportId", reportId);
      }

      setProgress("AI 分析中，請稍候...");

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || "AI 分析失敗");
      }

      setResult(json.data);
      setProgress("分析完成！");

      return json.data;
    } catch (err) {
      setError(err.message);
      setProgress("");
      throw err;
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