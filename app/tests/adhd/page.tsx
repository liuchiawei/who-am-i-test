"use client";

// ADHD 測驗頁面 - Client Component
// 負責狀態管理、測驗流程控制和結果計算

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import QuizCard from "@/components/feature/quiz/quiz-card";
import ResultCard from "@/components/feature/result/result-card";
import type { QuizData, QuizResult } from "@/types/quiz";
// 直接 import JSON 資料，避免 HTTP 請求問題
// TypeScript 配置已啟用 resolveJsonModule，可以直接 import
import adhdData from "@/data/adhd.json";

export default function ADHDTestPage() {
  // 直接使用 import 的資料，無需 async 載入
  const quizData = adhdData as QuizData;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(quizData.questions.length).fill(null)
  );
  const [isCompleted, setIsCompleted] = useState(false);

  // 計算滿分（每題最高分的總和）
  const maxScore = useMemo(() => {
    return quizData.questions.reduce((sum, question) => {
      // 找出該題所有選項中的最高分數
      const maxQuestionScore = Math.max(
        ...question.options.map((option) => option.score)
      );
      return sum + maxQuestionScore;
    }, 0);
  }, [quizData]);

  // 計算測驗結果
  const result = useMemo<QuizResult | null>(() => {
    if (!isCompleted) {
      return null;
    }

    // 檢查是否所有題目都已回答
    if (answers.some((ans) => ans === null)) {
      return null;
    }

    // 計算總分（根據選中的 value 找到對應的 option.score 並相加）
    // answers 儲存的是選中的 option.value，需要根據 value 找到對應的 option.score
    const totalScore: number = answers.reduce((sum, answerValue, questionIndex) => {
      // 根據問題索引和選中的 value，找到對應的 option，取得 score
      const question = quizData.questions[questionIndex];
      const selectedOption = question.options.find((opt) => opt.value === answerValue);
      if (!selectedOption) {
        return sum;
      }
      return sum + selectedOption.score;
    }, 0);

    // 根據總分判斷分級
    const range = quizData.scoring.ranges.find(
      (r) => totalScore >= r.min && totalScore <= r.max
    );

    if (!range) {
      return null;
    }

    return {
      totalScore,
      grade: range.grade,
      label: range.label,
      description: range.description,
    };
  }, [quizData, answers, isCompleted]);

  // 處理答案選擇 - 選擇答案後自動跳轉下一題
  const handleAnswer = (answer: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);

    // 自動跳轉到下一題（延遲一小段時間以提供視覺回饋）
    setTimeout(() => {
      if (currentQuestionIndex < quizData.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }, 300);
  };

  // 返回上一題
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // 前往下一題
  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      // 檢查當前題目是否已回答
      if (answers[currentQuestionIndex] !== null) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } else {
      // 最後一題時完成測驗
      handleComplete();
    }
  };

  // 完成測驗
  const handleComplete = () => {
    // 檢查是否所有題目都已回答
    if (answers.every((ans) => ans !== null)) {
      setIsCompleted(true);
    }
  };

  // 重新測驗
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers(new Array(quizData.questions.length).fill(null));
    setIsCompleted(false);
  };

  // 顯示結果頁面
  if (isCompleted && result) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ResultCard result={result} maxScore={maxScore} onRestart={handleRestart} />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // 顯示測驗頁面
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <motion.div
        key="header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <h1 className="text-3xl font-bold">{quizData.title}</h1>
        <p className="mt-2 text-muted-foreground">{quizData.description}</p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <QuizCard
            question={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            selectedAnswer={answers[currentQuestionIndex]}
            onAnswer={handleAnswer}
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={currentQuestionIndex > 0}
            canGoNext={answers[currentQuestionIndex] !== null}
            isLastQuestion={currentQuestionIndex === totalQuestions - 1}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
