"use client";

// 分享結果對話框 - 顯示預覽圖和分享選項
// 提供複製、下載、社群分享等功能

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  generateShareImageUrl,
  downloadImage,
  copyImageToClipboard,
  shareToSocial,
} from "@/lib/share-utils";
import type { QuizResult } from "@/types/quiz";
import {
  DownloadIcon,
  CopyIcon,
  Share2Icon,
  MessageCircleIcon,
  CheckIcon,
  Loader2Icon,
} from "lucide-react";
import Image from "next/image";

export interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizTitle: string;
  result: QuizResult;
  maxScore: number;
}

export default function ShareDialog({
  open,
  onOpenChange,
  quizTitle,
  result,
  maxScore,
}: ShareDialogProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 當對話框開啟時，生成圖片 URL
  useEffect(() => {
    if (open) {
      const url = generateShareImageUrl(quizTitle, result, maxScore);
      setImageUrl(url);
      setCopied(false);
      setError(null);
    }
  }, [open, quizTitle, result, maxScore]);

  // 處理下載圖片
  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);
      await downloadImage(imageUrl, `${quizTitle}_測驗結果.png`);
    } catch (err) {
      setError("下載失敗，請稍後再試");
      console.error("Download error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 處理複製到剪貼簿
  const handleCopy = async () => {
    try {
      setLoading(true);
      setError(null);
      await copyImageToClipboard(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("複製失敗，請確保使用 HTTPS 或 localhost");
      console.error("Copy error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 處理分享到 LINE
  const handleShareLine = () => {
    try {
      const fullUrl = typeof window !== "undefined" 
        ? `${window.location.origin}${imageUrl}`
        : imageUrl;
      shareToSocial("line", fullUrl, `${quizTitle} - ${result.label}`);
    } catch (err) {
      setError("分享失敗，請稍後再試");
      console.error("Share error:", err);
    }
  };

  // 處理分享到 X (Twitter)
  const handleShareTwitter = () => {
    try {
      const fullUrl = typeof window !== "undefined"
        ? `${window.location.origin}${imageUrl}`
        : imageUrl;
      shareToSocial(
        "twitter",
        fullUrl,
        `${quizTitle} - 我的測驗結果是：${result.label}`
      );
    } catch (err) {
      setError("分享失敗，請稍後再試");
      console.error("Share error:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>分享測驗結果</DialogTitle>
          <DialogDescription>
            選擇您想要的方式分享測驗結果
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 預覽圖 */}
          {imageUrl && (
            <div className="relative w-full aspect-[1200/630] rounded-lg border bg-muted overflow-hidden">
              <Image
                src={imageUrl}
                alt="測驗結果預覽圖"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {/* 錯誤訊息 */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}

          {/* 分享選項按鈕 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 下載圖片 */}
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={loading || !imageUrl}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <DownloadIcon className="size-4" />
              )}
              下載圖片
            </Button>

            {/* 複製到剪貼簿 */}
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={loading || !imageUrl || copied}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : copied ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
              {copied ? "已複製" : "複製圖片"}
            </Button>

            {/* 分享到 LINE */}
            <Button
              variant="outline"
              onClick={handleShareLine}
              disabled={!imageUrl}
              className="flex items-center gap-2 bg-[#06C755] text-white hover:bg-[#05B148] border-[#06C755]"
            >
              <MessageCircleIcon className="size-4" />
              分享到 LINE
            </Button>

            {/* 分享到 X (Twitter) */}
            <Button
              variant="outline"
              onClick={handleShareTwitter}
              disabled={!imageUrl}
              className="flex items-center gap-2 bg-black text-white hover:bg-gray-900 border-black dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              <span className="text-lg font-bold">𝕏</span>
              分享到 X
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
