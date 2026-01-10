// 測驗卡片 底部 - 導航按鈕
// 第一題隱藏上一題按鈕，最後一題顯示「完成」而非「下一題」

import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon } from "lucide-react";

export interface QuizCardFooterProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function QuizCardFooter({
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  onPrevious,
  onNext,
}: QuizCardFooterProps) {
  return (
    <CardFooter className="flex justify-between">
      <Button
        variant={canGoPrevious ? "outline" : "ghost"}
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={!canGoPrevious ? "invisible" : ""}
      >
        <ArrowLeftIcon className="size-4" />
        上一題
      </Button>
      <Button variant="default" onClick={onNext} disabled={!canGoNext}>
        {isLastQuestion ? (
          <>
            <CheckIcon className="size-4" />
            完成測驗
          </>
        ) : (
          <>
            下一題
            <ArrowRightIcon className="size-4" />
          </>
        )}
      </Button>
    </CardFooter>
  );
}
