"use client";

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
import { HomeIcon, RotateCcwIcon, Share2Icon } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useState, useMemo } from "react";
import ShareDialog from "./share-dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

export interface ResultCardProps {
  result: QuizResult;
  maxScore: number;
  quizTitle?: string;
  onRestart?: () => void;
}

export default function ResultCard({
  result,
  maxScore,
  quizTitle = "測驗結果",
  onRestart,
}: ResultCardProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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

  // 根據分級設定圖表顏色
  const getGradeChartColor = (grade: string) => {
    switch (grade) {
      case "low":
        return {
          light: "hsl(142, 71%, 45%)",
          dark: "hsl(142, 70%, 50%)",
        };
      case "medium":
        return {
          light: "hsl(43, 96%, 56%)",
          dark: "hsl(43, 90%, 60%)",
        };
      case "high":
        return {
          light: "hsl(0, 84%, 60%)",
          dark: "hsl(0, 80%, 65%)",
        };
      default:
        return {
          light: "hsl(var(--primary))",
          dark: "hsl(var(--primary))",
        };
    }
  };

  // 圖表配置
  const chartConfig = useMemo(() => {
    const chartColor = getGradeChartColor(result.grade);
    return {
      score: {
        label: "得分",
        theme: {
          light: chartColor.light,
          dark: chartColor.dark,
        },
      },
      remaining: {
        label: "未得分",
        theme: {
          light: "hsl(var(--muted))",
          dark: "hsl(var(--muted))",
        },
      },
    };
  }, [result.grade]);

  // 計算圖表數據：已得分數和未得分數
  const chartData = useMemo(() => {
    const score = result.totalScore;
    const remaining = Math.max(0, maxScore - score);

    return [
      {
        name: "score",
        label: "得分",
        value: score,
        fill: "var(--color-score)",
      },
      {
        name: "remaining",
        label: "未得分",
        value: remaining,
        fill: "var(--color-remaining)",
      },
    ];
  }, [result.totalScore, maxScore]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">測驗結果</CardTitle>
        <CardDescription className="text-center">
          根據您的回答計算的評估結果
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* 總分 Chart Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center space-y-2"
        >
          <div className="text-sm text-muted-foreground">總分</div>
          <div className="relative w-full max-w-[280px] aspect-square mx-auto">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full [&>svg]:w-full [&>svg]:h-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="name" />}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-5xl font-black">{result.totalScore}</div>
              <div className="text-sm text-muted-foreground">
                滿分 {maxScore} 分
              </div>
            </div>
          </div>
        </motion.div>

        {/* 風險等級 Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="text-sm text-muted-foreground">風險等級</div>
          <div
            className={`text-2xl font-bold text-center ${getGradeColor(result.grade)}`}
          >
            {result.label}
          </div>
        </motion.div>

        {/* 評估說明 Zone */}
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
        <Button
          variant="outline"
          onClick={() => setShareDialogOpen(true)}
          className="flex-1"
        >
          <Share2Icon className="size-4" />
          分享結果
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/">
            <HomeIcon className="size-4" />
            返回首頁
          </Link>
        </Button>
      </CardFooter>

      {/* 分享對話框 */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        quizTitle={quizTitle}
        result={result}
        maxScore={maxScore}
      />
    </Card>
  );
}
