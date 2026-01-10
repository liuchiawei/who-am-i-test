"use client";

// 測驗卡片 內容區 - 顯示選項並處理答案選擇
// 使用 RadioGroup 實作單選，選擇答案後自動觸發 onAnswer 回調
// 選項使用 {value, label} 格式，直接使用 value 作為分數
// 選項添加動畫效果以提升使用者體驗

import { CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import type { QuestionOption } from "@/types/quiz";

export interface QuizCardContentProps {
  options: QuestionOption[];
  selectedAnswer: number | null;
  onAnswer: (answer: number) => void;
}

export default function QuizCardContent({
  options,
  selectedAnswer,
  onAnswer,
}: QuizCardContentProps) {
  // 選擇答案時，直接使用選項的 value 作為分數並觸發回調
  const handleValueChange = (value: string) => {
    const answerValue = parseInt(value, 10);
    onAnswer(answerValue);
  };

  return (
    <CardContent>
      <RadioGroup
        value={selectedAnswer !== null ? selectedAnswer.toString() : undefined}
        onValueChange={handleValueChange}
        className="gap-2"
      >
        {options.map((option, index) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            className="flex items-center space-x-3 rounded-md border p-3 transition-colors hover:bg-accent"
          >
            <RadioGroupItem
              value={option.value.toString()}
              id={`option-${option.value}`}
            />
            <Label
              htmlFor={`option-${option.value}`}
              className="flex-1 cursor-pointer font-normal"
            >
              {option.label}
            </Label>
          </motion.div>
        ))}
      </RadioGroup>
    </CardContent>
  );
}
