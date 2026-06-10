/**
 * 圖片工具函式
 * 放置位置：lib/imageUtils.js
 *
 * 提供：
 * - fileToBase64()       將 File 轉 base64（供 API 使用）
 * - compressAndConvert() 瀏覽器端壓縮（避免圖太大）
 * - getPreviewUrl()      產生預覽用 URL
 */

const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

/**
 * 將 File 物件轉為 Base64 字串
 * @param {File} file
 * @returns {Promise<{ base64: string, mimeType: string }>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      reject(new Error(`不支援的格式：${file.type}，請上傳 JPG、PNG 或 WebP`));
      return;
    }
    if (file.size / (1024 * 1024) > MAX_SIZE_MB) {
      reject(new Error(`圖片超過 ${MAX_SIZE_MB}MB，請壓縮後再上傳`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = () => reject(new Error("圖片讀取失敗"));
    reader.readAsDataURL(file);
  });
}

/**
 * 壓縮圖片並轉 base64（瀏覽器端，Canvas 壓縮）
 * @param {File}   file
 * @param {number} maxWidthPx 最大寬度，預設 1280
 * @param {number} quality    JPEG 品質 0-1，預設 0.85
 * @returns {Promise<{ base64: string, mimeType: string }>}
 */
export function compressAndConvert(file, maxWidthPx = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      reject(new Error(`不支援的格式：${file.type}`));
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxWidthPx) {
        height = Math.round((height * maxWidthPx) / width);
        width = maxWidthPx;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ base64: reader.result.split(",")[1], mimeType: "image/jpeg" });
          reader.onerror = () => reject(new Error("壓縮後讀取失敗"));
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("圖片載入失敗")); };
    img.src = objectUrl;
  });
}

/**
 * 取得圖片預覽 URL（元件 unmount 時記得 URL.revokeObjectURL）
 */
export function getPreviewUrl(file) {
  return URL.createObjectURL(file);
}
