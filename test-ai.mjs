/**
 * AI 模組測試腳本
 * 執行方式：GEMINI_API_KEY=你的key node tests/test-ai.mjs
 *
 * 或在 .env.local 設定後執行：node --env-file=.env.local tests/test-ai.mjs
 */

import { analyzeReport, analyzeTextOnly } from "../lib/analyzeReport.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const G = "\x1b[32m", R = "\x1b[31m", Y = "\x1b[33m", B = "\x1b[1m", X = "\x1b[0m";
const pass = m => console.log(`${G}✅ PASS${X} ${m}`);
const fail = m => console.log(`${R}❌ FAIL${X} ${m}`);
const info = m => console.log(`${Y}ℹ️  ${X}${m}`);

async function run() {
  console.log(`\n${B}=== StreetFix Taiwan AI 模組測試 ===${X}\n`);

  // Test 1: API Key
  if (!process.env.GEMINI_API_KEY) {
    fail("GEMINI_API_KEY 未設定");
    info("執行方式：GEMINI_API_KEY=你的key node tests/test-ai.mjs");
    return;
  }
  pass("GEMINI_API_KEY 已設定");

  // Test 2: 純文字分析
  console.log(`\n${B}Test 2: 純文字分析${X}`);
  try {
    const r = await analyzeTextOnly("台北市信義區忠孝東路上有大型路面坑洞，深約15公分，騎車很危險");
    info(`title: ${r.title}`);
    info(`category: ${r.category}`);
    info(`severity: ${r.severity}`);
    info(`ai_summary: ${r.ai_summary}`);
    info(`ai_confidence: ${Math.round(r.ai_confidence * 100)}%`);
    pass("純文字分析成功");
    console.log("\n完整後端格式輸出：");
    console.log(JSON.stringify(r, null, 2));
  } catch (e) {
    fail(`純文字分析失敗：${e.message}`);
  }

  // Test 3: 圖片分析（若有測試圖片）
  console.log(`\n${B}Test 3: 圖片分析${X}`);
  const imgPath = path.join(__dirname, "test-image.jpg");
  if (fs.existsSync(imgPath)) {
    try {
      const base64 = fs.readFileSync(imgPath).toString("base64");
      const r = await analyzeReport({ imageBase64: base64, mimeType: "image/jpeg", userDescription: "這是路面問題" });
      info(`category: ${r.category}  severity: ${r.severity}`);
      pass("圖片分析成功");
    } catch (e) { fail(`圖片分析失敗：${e.message}`); }
  } else {
    info("無測試圖片，跳過（可在 tests/ 放入 test-image.jpg）");
  }

  console.log(`\n${B}=== 測試完成 ===${X}\n`);
}

run().catch(console.error);
