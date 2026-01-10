// 分享功能工具函數 - 處理圖片生成、下載、複製和社群分享

import type { QuizResult } from "@/types/quiz";

/**
 * 生成分享圖片的 API URL
 * 使用查詢參數傳遞測驗結果資料
 */
export function generateShareImageUrl(
  quizTitle: string,
  result: QuizResult,
  maxScore: number
): string {
  const params = new URLSearchParams({
    title: quizTitle,
    totalScore: result.totalScore.toString(),
    maxScore: maxScore.toString(),
    label: result.label,
    description: result.description,
    grade: result.grade,
  });

  return `/api/share/og?${params.toString()}`;
}

/**
 * 下載圖片到本地
 */
export async function downloadImage(imageUrl: string, filename: string = "測驗結果.png"): Promise<void> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理 URL 物件
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download image:", error);
    throw error;
  }
}

/**
 * 複製圖片到剪貼簿
 * 注意：需要 HTTPS 環境或 localhost
 */
export async function copyImageToClipboard(imageUrl: string): Promise<void> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const blob = await response.blob();

    // 檢查瀏覽器是否支援 ClipboardItem
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error("Clipboard API not supported");
    }

    const clipboardItem = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([clipboardItem]);
  } catch (error) {
    console.error("Failed to copy image to clipboard:", error);
    throw error;
  }
}

/**
 * 分享到社群媒體
 */
export function shareToSocial(
  platform: "line" | "twitter" | "facebook",
  imageUrl: string,
  text?: string
): void {
  const encodedImageUrl = encodeURIComponent(imageUrl);
  const encodedText = text ? encodeURIComponent(text) : "";

  let shareUrl = "";

  switch (platform) {
    case "line":
      // LINE 分享：使用 lineit share 插件
      shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodedImageUrl}`;
      break;
    case "twitter":
      // X (Twitter) 分享
      shareUrl = `https://twitter.com/intent/tweet?url=${encodedImageUrl}${encodedText ? `&text=${encodedText}` : ""}`;
      break;
    case "facebook":
      // Facebook 分享
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedImageUrl}`;
      break;
  }

  if (shareUrl) {
    window.open(shareUrl, "_blank", "width=600,height=400");
  }
}

/**
 * 使用 Web Share API 分享（如果瀏覽器支援）
 */
export async function shareViaWebShareAPI(
  imageUrl: string,
  title: string,
  text: string
): Promise<void> {
  if (!navigator.share) {
    throw new Error("Web Share API not supported");
  }

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], "測驗結果.png", { type: "image/png" });

    await navigator.share({
      title,
      text,
      files: [file],
    });
  } catch (error) {
    console.error("Failed to share via Web Share API:", error);
    throw error;
  }
}
