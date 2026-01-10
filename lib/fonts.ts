// 字體管理 - Satori 用於生成圖片時需要載入的字體配置
// Noto Sans TC 用於正確顯示繁體中文

import { readFile } from "fs/promises";
import { join } from "path";

export interface FontConfig {
  name: string;
  data: ArrayBuffer | Uint8Array;
  weight?: number;
  style?: string;
}

/**
 * 從本地檔案或 CDN 載入 Noto Sans TC 字體
 * Satori 需要字體檔案才能正確渲染中文
 * Server 端執行，使用 Node.js API
 */
export async function loadNotoSansTC(): Promise<FontConfig> {
  // 優先嘗試從本地檔案載入（支援 .ttf 和 .woff2 格式）
  // 先嘗試 .ttf，因為用戶已經下載了這個格式
  const fontPaths = [
    join(process.cwd(), "public", "fonts", "NotoSansTC-Regular.ttf"),
    join(process.cwd(), "public", "fonts", "NotoSansTC-Regular.woff2"),
  ];

  // 嘗試載入本地字體檔案
  for (const fontPath of fontPaths) {
    try {
      const fontBuffer = await readFile(fontPath);
      // 確保返回正確的 ArrayBuffer（Satori 需要）
      // 創建新的 ArrayBuffer 副本，確保資料完整性
      const fontData = new ArrayBuffer(fontBuffer.length);
      const view = new Uint8Array(fontData);
      view.set(fontBuffer);
      
      return {
        name: "Noto Sans TC",
        data: fontData,
        weight: 400,
        style: "normal",
      };
    } catch (error) {
      // 繼續嘗試下一個路徑
      continue;
    }
  }

  // 如果本地檔案不存在，嘗試從 node_modules 載入
  try {
    const nodeModulesFontPath = join(
      process.cwd(),
      "node_modules",
      "@fontsource",
      "noto-sans-tc",
      "files",
      "noto-sans-tc-0-400-normal.woff2"
    );
    const fontBuffer = await readFile(nodeModulesFontPath);
    // 創建新的 ArrayBuffer 副本
    const fontData = new ArrayBuffer(fontBuffer.length);
    const view = new Uint8Array(fontData);
    view.set(fontBuffer);

    // 複製到 public/fonts 以便下次直接使用（作為 woff2）
    try {
      const fs = await import("fs/promises");
      const fontDir = join(process.cwd(), "public", "fonts");
      await fs.mkdir(fontDir, { recursive: true });
      const targetPath = join(fontDir, "NotoSansTC-Regular.woff2");
      await fs.copyFile(nodeModulesFontPath, targetPath);
    } catch {
      // 忽略複製失敗
    }

    return {
      name: "Noto Sans TC",
      data: fontData,
      weight: 400,
      style: "normal",
    };
  } catch {
    // node_modules 中沒有，嘗試從 CDN 載入
    const fontUrls = [
      // 使用 jsDelivr CDN（最可靠，使用實際存在的檔案名稱）
      "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-tc@5.2.8/files/noto-sans-tc-0-400-normal.woff2",
      // 備用：使用 unpkg
      "https://unpkg.com/@fontsource/noto-sans-tc@5.2.8/files/noto-sans-tc-0-400-normal.woff2",
    ];

    let lastError: Error | null = null;

    for (const fontUrl of fontUrls) {
      try {
        const response = await fetch(fontUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Next.js Server)",
          },
        });

        if (!response.ok) {
          continue;
        }

        const fontData = await response.arrayBuffer();

        if (fontData.byteLength === 0) {
          continue;
        }

        // 儲存到本地以便下次使用（作為 woff2）
        try {
          const fs = await import("fs/promises");
          const fontDir = join(process.cwd(), "public", "fonts");
          await fs.mkdir(fontDir, { recursive: true });
          const targetPath = join(fontDir, "NotoSansTC-Regular.woff2");
          await fs.writeFile(targetPath, Buffer.from(fontData));
        } catch {
          // 忽略儲存失敗
        }

        return {
          name: "Noto Sans TC",
          data: fontData,
          weight: 400,
          style: "normal",
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // 所有來源都失敗，拋出錯誤
    throw new Error(
      `無法載入字體：本地檔案、node_modules 和所有 CDN 來源都失敗。最後錯誤: ${lastError?.message || "未知錯誤"}`
    );
  }
}
