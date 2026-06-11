"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MapComponent from "@/components/MapComponent";
import { analyzeImage, submitReport } from "@/lib/report";

const categoryOptions = ["道路坑洞", "人行道破損", "路燈故障", "垃圾堆積", "排水異常"] as const;

export default function ReportPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]>(categoryOptions[0]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [location, setLocation] = useState({ lat: 24.801, lng: 120.971 });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const previewUrl = useMemo(() => {
    if (!mediaFile) {
      return "";
    }
    return URL.createObjectURL(mediaFile);
  }, [mediaFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setMediaFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await analyzeImage(mediaFile);
      await submitReport({
        title,
        description: `${description}\n類別：${category}`,
        imageUrl: previewUrl,
        location,
      });

      setMessage("通報已送出（目前為前端示範流程）");
      setTitle("");
      setDescription("");
      setMediaFile(null);
    } catch {
      setMessage("通報失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/" className="text-sm font-medium text-teal-800 underline underline-offset-4">
          回到首頁
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-teal-900 sm:text-3xl">問題通報表單</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-5 shadow-md sm:p-8">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-semibold text-teal-900">
            標題
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="min-h-12 w-full rounded-xl border border-teal-200 px-4 py-3 text-base outline-none ring-teal-400 focus:ring-2"
            placeholder="例如：某路段有明顯坑洞"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-semibold text-teal-900">
            描述
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            rows={5}
            className="w-full rounded-xl border border-teal-200 px-4 py-3 text-base outline-none ring-teal-400 focus:ring-2"
            placeholder="請描述問題位置、範圍與狀況"
          />
        </div>

        <div>
          <label htmlFor="media" className="mb-2 block text-sm font-semibold text-teal-900">
            上傳照片或影片
          </label>
          <input
            id="media"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="block min-h-12 w-full rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-teal-700 file:px-4 file:py-2 file:font-medium file:text-white"
          />
          {mediaFile && previewUrl ? (
            <div className="mt-3 rounded-xl border border-teal-100 p-3">
              {mediaFile.type.startsWith("video/") ? (
                <video src={previewUrl} controls className="w-full rounded-lg" />
              ) : (
                <Image
                  src={previewUrl}
                  alt="上傳預覽"
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-auto w-full rounded-lg object-cover"
                />
              )}
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-semibold text-teal-900">
            類別
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value as (typeof categoryOptions)[number])}
            className="min-h-12 w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-base outline-none ring-teal-400 focus:ring-2"
          >
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <MapComponent lat={location.lat} lng={location.lng} onLocationChange={setLocation} />

        <button
          type="submit"
          disabled={submitting}
          className="min-h-12 w-full rounded-xl bg-teal-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-400"
        >
          {submitting ? "送出中..." : "送出通報"}
        </button>

        {message ? <p className="text-sm font-medium text-teal-800">{message}</p> : null}
      </form>
    </main>
  );
}
