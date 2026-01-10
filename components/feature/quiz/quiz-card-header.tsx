// 測驗卡片 標題區 - 顯示題目編號和問題文字

import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface QuizCardHeaderProps {
  question: string;
  currentIndex: number;
  totalQuestions: number;
}

export default function QuizCardHeader({
  question,
  currentIndex,
  totalQuestions,
}: QuizCardHeaderProps) {
  return (
    <CardHeader>
      <CardDescription>
        第 {currentIndex + 1} / {totalQuestions} 題
      </CardDescription>
      <CardTitle className="text-lg">{question}</CardTitle>
    </CardHeader>
  );
}
