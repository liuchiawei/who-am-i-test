"use client";

// ADHD 測驗頁面 - Client Component
// 負責狀態管理、測驗流程控制和結果計算

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import QuizCard from "@/components/feature/quiz/quiz-card";
import ResultCard from "@/components/feature/result/result-card";
import QuizProgressbar from "@/components/feature/quiz/quiz-progressbar";
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

  // 計算滿分（只計算 isMain: true 的題目，每題最高分的總和）
  const maxScore = useMemo(() => {
    return quizData.questions
      .filter((question) => question.isMain === true)
      .reduce((sum, question) => {
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

    // 計算主要分數（只計算 isMain: true 的題目）
    // answers 儲存的是選中的 option.value，需要根據 value 找到對應的 option.score
    let totalScore = 0;
    for (
      let questionIndex = 0;
      questionIndex < answers.length;
      questionIndex++
    ) {
      const question = quizData.questions[questionIndex];
      // 只計算 isMain: true 的題目
      if (question.isMain !== true) {
        continue;
      }

      const answerValue = answers[questionIndex];
      // null チェック（防御的プログラミング、TypeScript の型チェックを通過するため）
      if (answerValue === null) {
        continue;
      }
      // 根據問題索引和選中的 value，找到對應的 option，取得 score
      const selectedOption = question.options.find(
        (opt) => opt.value === answerValue
      );
      if (selectedOption) {
        totalScore += selectedOption.score;
      }
    }

    // 計算各個 subscale 的分數
    // subscale 包含所有相關題目（不論 isMain）
    const subscaleScores: {
      [key: string]: { score: number; maxScore: number };
    } = {};
    const subscales = ["Inattentiveness", "Impulsivity", "Verbal"];

    for (const subscale of subscales) {
      let score = 0;
      let maxScore = 0;

      for (
        let questionIndex = 0;
        questionIndex < quizData.questions.length;
        questionIndex++
      ) {
        const question = quizData.questions[questionIndex];
        // 只計算該 subscale 的題目
        if (question.subscale !== subscale) {
          continue;
        }

        // 計算該題最高分
        const maxQuestionScore = Math.max(
          ...question.options.map((option) => option.score)
        );
        maxScore += maxQuestionScore;

        // 計算該題得分
        const answerValue = answers[questionIndex];
        if (answerValue !== null) {
          const selectedOption = question.options.find(
            (opt) => opt.value === answerValue
          );
          if (selectedOption) {
            score += selectedOption.score;
          }
        }
      }

      if (maxScore > 0) {
        // 只有當該 subscale 有題目時才記錄
        subscaleScores[subscale] = { score, maxScore };
      }
    }

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
      subscaleScores:
        Object.keys(subscaleScores).length > 0 ? subscaleScores : undefined,
    };
  }, [quizData, answers, isCompleted]);

  // 處理答案選擇 - 選擇答案後自動跳轉下一題或完成測驗
  const handleAnswer = (answer: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);

    // 自動跳轉到下一題或完成測驗（延遲一小段時間以提供視覺回饋）
    setTimeout(() => {
      const isLastQuestion =
        currentQuestionIndex === quizData.questions.length - 1;

      if (isLastQuestion) {
        // 最後一題時，檢查所有題目是否都已回答，然後自動完成測驗
        // newAnswers 是最新的答案陣列，因為剛剛更新了當前題目的答案
        if (newAnswers.every((ans) => ans !== null)) {
          setIsCompleted(true);
        }
      } else {
        // 不是最後一題時，跳轉到下一題
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }, 100);
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
            <ResultCard
              result={result}
              maxScore={maxScore}
              quizTitle={quizData.title}
              onRestart={handleRestart}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // 顯示測驗頁面
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;

  // 判斷是否已開始作答（有任何答案或已跳轉題目）
  const hasStarted =
    answers.some((ans) => ans !== null) || currentQuestionIndex > 0;

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div
            key="header-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-6 text-center"
          >
            <h1 className="text-3xl font-bold">{quizData.title}</h1>
            <p className="mt-2 text-muted-foreground">{quizData.description}</p>
          </motion.div>
        ) : (
          <motion.div
            key="header-progress"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <QuizProgressbar
              currentIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
