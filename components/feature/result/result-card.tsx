// 測驗結果卡片 - 顯示總分、分級和詳細描述
// 使用動畫效果增強結果顯示的視覺吸引力

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuizResult } from "@/types/quiz";
import { HomeIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export interface ResultCardProps {
  result: QuizResult;
  maxScore: number;
  onRestart?: () => void;
}

export default function ResultCard({
  result,
  maxScore,
  onRestart,
}: ResultCardProps) {
  // 根據分級設定顏色樣式
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "low":
        return "text-green-600 dark:text-green-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "high":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">測驗結果</CardTitle>
        <CardDescription>根據您的回答計算的評估結果</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-2"
        >
          <div className="text-sm text-muted-foreground">總分</div>
          <div className="text-5xl font-bold">{result.totalScore}</div>
          <div className="text-sm text-muted-foreground">
            滿分 {maxScore} 分
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-2"
        >
          <div className="text-sm text-muted-foreground">風險等級</div>
          <div
            className={`text-2xl font-semibold ${getGradeColor(result.grade)}`}
          >
            {result.label}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-2"
        >
          <div className="text-sm text-muted-foreground">評估說明</div>
          <div className="rounded-lg border bg-muted/50 p-4 text-sm leading-relaxed">
            {result.description}
          </div>
        </motion.div>
      </CardContent>
      <CardFooter className="flex gap-3">
        {onRestart && (
          <Button variant="outline" onClick={onRestart} className="flex-1">
            <RotateCcwIcon className="size-4" />
            重新測驗
          </Button>
        )}
        <Button variant="outline" asChild className="flex-1">
          <Link href="/">
            <HomeIcon className="size-4" />
            返回首頁
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
