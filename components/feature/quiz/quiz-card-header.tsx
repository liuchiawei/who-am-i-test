// 測驗卡片 標題區 - 顯示題目編號和問題文字

import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface QuizCardHeaderProps {
  questionTitle?: string;
  question: string;
  currentIndex: number;
  totalQuestions: number;
}

export default function QuizCardHeader({
  questionTitle,
  question,
  currentIndex,
  totalQuestions,
}: QuizCardHeaderProps) {
  return (
    <CardHeader>
      <CardDescription>
        第 {currentIndex + 1} / {totalQuestions} 題
      </CardDescription>
      <CardTitle className="text-lg">
        {questionTitle ? questionTitle : question}
      </CardTitle>
      {questionTitle && (
        <CardDescription className="text-sm text-muted-foreground text-justify">
          {question}
        </CardDescription>
      )}
    </CardHeader>
  );
}
