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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

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

  // subscale 名稱的中文對照
  const getSubscaleLabel = (subscale: string) => {
    switch (subscale) {
      case "Inattentiveness":
        return "注意力不集中";
      case "Impulsivity":
        return "衝動/多動";
      case "Verbal":
        return "語言過動";
      default:
        return subscale;
    }
  };

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

  // 計算雷達圖數據：將 subscale 分數轉換為百分比
  const radarData = useMemo(() => {
    if (!result.subscaleScores) return [];
    return Object.entries(result.subscaleScores).map(
      ([subscale, { score, maxScore: subMaxScore }]) => ({
        subject: getSubscaleLabel(subscale),
        percentage: Math.round((score / subMaxScore) * 100),
        fullMark: 100,
      })
    );
  }, [result.subscaleScores]);

  // 雷達圖配置
  const radarChartConfig = useMemo(() => {
    const chartColor = getGradeChartColor(result.grade);
    return {
      percentage: {
        label: "百分比",
        theme: {
          light: chartColor.light,
          dark: chartColor.dark,
        },
      },
    };
  }, [result.grade]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">測驗結果</CardTitle>
      </CardHeader>
      <Tabs defaultValue="overview" className="w-full">
        <CardContent className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="radar">雷達圖</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-2 mt-4">
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
                className={`text-2xl font-bold text-center ${getGradeColor(
                  result.grade
                )}`}
              >
                {result.label}
              </div>
            </motion.div>

            {/* Subscale 分數 Zone */}
            {result.subscaleScores &&
              Object.keys(result.subscaleScores).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="space-y-3"
                >
                  <div className="text-sm text-muted-foreground">
                    各維度分數
                  </div>
                  <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                    {Object.entries(result.subscaleScores).map(
                      ([subscale, { score, maxScore: subMaxScore }], index) => (
                        <motion.div
                          key={subscale}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.4 + index * 0.1,
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">
                              {getSubscaleLabel(subscale)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {score} / {subMaxScore}
                            </div>
                          </div>
                          {/* 進度條 */}
                          <div className="w-full bg-muted rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(score / subMaxScore) * 100}%`,
                              }}
                              transition={{
                                duration: 0.5,
                                delay: 0.5 + index * 0.1,
                              }}
                              className="h-2 bg-primary rounded-full"
                            />
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>
                </motion.div>
              )}

            {/* 評估說明 Zone */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay:
                  result.subscaleScores &&
                  Object.keys(result.subscaleScores).length > 0
                    ? 0.4 +
                      Object.keys(result.subscaleScores).length * 0.1 +
                      0.2
                    : 0.3,
              }}
              className="space-y-2"
            >
              <div className="text-sm text-muted-foreground">評估說明</div>
              <div className="rounded-lg border bg-muted/50 p-4 text-sm leading-relaxed">
                {result.description}
              </div>
            </motion.div>
          </TabsContent>

          {/* 雷達圖 Tab */}
          <TabsContent value="radar" className="mt-4">
            {radarData.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center space-y-3"
              >
                <div className="text-sm text-muted-foreground text-center">
                  各維度分數（百分比）
                </div>
                <div className="w-full max-w-[400px] aspect-square border">
                  <ChartContainer
                    config={radarChartConfig}
                    className="h-full w-full"
                  >
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis
                        dataKey="subject"
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: any) => {
                              const numValue =
                                typeof value === "number"
                                  ? value
                                  : Number(value);
                              return [`${numValue}%`, "百分比"];
                            }}
                          />
                        }
                      />
                      <Radar
                        name="百分比"
                        dataKey="percentage"
                        stroke="var(--color-percentage)"
                        fill="var(--color-percentage)"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ChartContainer>
                </div>
                {/* 顯示詳細數據 */}
                <div className="w-full space-y-2 rounded-lg border bg-muted/30 p-3">
                  {radarData.map((item, index) => (
                    <motion.div
                      key={item.subject}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex-shrink-0 text-sm font-medium">{item.subject}</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                          className="h-2 bg-primary rounded-full"
                        />
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {item.percentage}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                暫無維度分數數據
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
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
