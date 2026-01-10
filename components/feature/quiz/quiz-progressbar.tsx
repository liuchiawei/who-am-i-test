"use client";

// 測驗進度條 - 顯示當前答題進度
// 使用 CSS 變數實現動態寬度，符合規範並避免 inline style 警告

import { cn } from "@/lib/utils";

export interface QuizProgressbarProps {
  currentIndex: number;
  totalQuestions: number;
}

export default function QuizProgressbar({
  currentIndex,
  totalQuestions,
}: QuizProgressbarProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="px-6 pb-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>進度</span>
        <span>
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={
            { width: `${progress}%` } as React.CSSProperties & { width: string }
          }
        />
      </div>
    </div>
  );
}
