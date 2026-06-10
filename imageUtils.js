/**
 * 圖片工具函式
 * 負責圖片的 Base64 轉換、格式驗證、壓縮
 */

const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

/**
 * 將 File 物件轉為 Base64 字串
 * @param {File} file - 瀏覽器 File 物件
 * @returns {Promise<{ base64: string, mimeType: string }>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    // 驗證格式
    if (!SUPPORTED_TYPES.includes(file.type)) {
      reject(new Error(`不支援的圖片格式：${file.type}。請上傳 JPG、PNG 或 WebP`));
      return;
    }

    // 驗證大小
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      reject(new Error(`圖片太大（${sizeMB.toFixed(1)} MB），請壓縮至 ${MAX_SIZE_MB} MB 以下`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      // result 格式為 "data:image/jpeg;base64,/9j/4AAQ..."
      const dataUrl = reader.result;
      const base64 = dataUrl.split(",")[1]; // 只取逗號後面的部分
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = () => reject(new Error("圖片讀取失敗"));
    reader.readAsDataURL(file);
  });
}

/**
 * 壓縮圖片（在瀏覽器端用 Canvas 壓縮）
 * 避免圖片太大導致 API 超時
 * @param {File} file
 * @param {number} maxWidthPx - 最大寬度（預設 1280px）
 * @param {number} quality    - JPEG 品質 0-1（預設 0.85）
 * @returns {Promise<{ base64: string, mimeType: string }>}
 */
export function compressAndConvert(file, maxWidthPx = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      reject(new Error(`不支援的圖片格式：${file.type}`));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // 計算縮放比例
      let { width, height } = img;
      if (width > maxWidthPx) {
        height = Math.round((height * maxWidthPx) / width);
        width = maxWidthPx;
      }

      // 用 Canvas 繪製並輸出
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(",")[1];
            resolve({ base64, mimeType: "image/jpeg" });
          };
          reader.onerror = () => reject(new Error("壓縮後讀取失敗"));
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("圖片載入失敗，請確認檔案是否損壞"));
    };

    img.src = objectUrl;
  });
}

/**
 * 取得圖片預覽 URL（供 UI 顯示用）
 * 記得在元件 unmount 時呼叫 URL.revokeObjectURL(url) 釋放記憶體
 */
export function getPreviewUrl(file) {
  return URL.createObjectURL(file);
}
