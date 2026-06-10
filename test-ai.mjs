/**
 * AI 模組測試腳本
 * 
 * 執行方式（在 ai-analysis 資料夾下）：
 *   node tests/test-ai.mjs
 *
 * 需先設定 .env.local 中的 GEMINI_API_KEY
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeReport, analyzeTextOnly } from "../lib/analyzeReport.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 顏色輸出
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function pass(msg) { console.log(`${GREEN}✅ PASS${RESET} ${msg}`); }
function fail(msg) { console.log(`${RED}❌ FAIL${RESET} ${msg}`); }
function info(msg) { console.log(`${YELLOW}ℹ️  INFO${RESET} ${msg}`); }

async function runTests() {
  console.log(`\n${BOLD}=== StreetFix Taiwan — AI 模組測試 ===${RESET}\n`);

  // ── Test 1: 環境變數檢查 ──────────────────────────────────────────────────
  console.log(`${BOLD}Test 1: 環境變數檢查${RESET}`);
  if (process.env.GEMINI_API_KEY) {
    pass("GEMINI_API_KEY 已設定");
  } else {
    fail("GEMINI_API_KEY 未設定！請在 .env.local 加入 GEMINI_API_KEY=your_key");
    console.log("⚠️  跳過 API 呼叫測試\n");
    return;
  }

  // ── Test 2: 純文字分析 ────────────────────────────────────────────────────
  console.log(`\n${BOLD}Test 2: 純文字分析（無圖片）${RESET}`);
  try {
    const result = await analyzeTextOnly("台北市信義區忠孝東路上有一個大坑洞，深約15公分，騎機車很危險");
    info(`分類：${result.category}`);
    info(`嚴重程度：${result.severity_label}（${result.severity_score}/10）`);
    info(`摘要：${result.summary}`);
    info(`信心度：${Math.round(result.confidence * 100)}%`);
    pass("純文字分析成功");
    console.log("\n完整回應：");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    fail(`純文字分析失敗：${err.message}`);
  }

  // ── Test 3: 有圖片的分析（若測試資料夾有圖片） ──────────────────────────
  console.log(`\n${BOLD}Test 3: 圖片分析${RESET}`);
  const testImagePath = path.join(__dirname, "test-image.jpg");
  if (fs.existsSync(testImagePath)) {
    try {
      const imageBuffer = fs.readFileSync(testImagePath);
      const base64 = imageBuffer.toString("base64");
      const result = await analyzeReport({
        imageBase64: base64,
        mimeType: "image/jpeg",
        userDescription: "這是路面問題",
      });
      info(`分類：${result.category}`);
      info(`嚴重程度：${result.severity_label}`);
      info(`摘要：${result.summary}`);
      pass("圖片分析成功");
    } catch (err) {
      fail(`圖片分析失敗：${err.message}`);
    }
  } else {
    info(`未找到測試圖片 (${testImagePath})，跳過圖片分析測試`);
    info("若要測試圖片分析，請在 tests/ 資料夾放入 test-image.jpg");
  }

  // ── Test 4: 錯誤處理測試 ─────────────────────────────────────────────────
  console.log(`\n${BOLD}Test 4: 錯誤處理（空輸入）${RESET}`);
  try {
    await analyzeTextOnly(""); // 空字串應在 API Route 層被擋，這裡直接測 lib 層
    // lib 層會呼叫 Gemini，結果可能是 Gemini 回應無效 JSON 或錯誤
    info("空字串送出，Gemini 可能仍回傳結果（正常行為）");
  } catch (err) {
    info(`空輸入引發錯誤（預期行為）：${err.message}`);
  }

  console.log(`\n${BOLD}=== 測試完成 ===${RESET}\n`);
}

runTests().catch(console.error);
