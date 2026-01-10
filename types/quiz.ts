// 測驗相關類型定義

export interface QuestionOption {
  value: number;
  label: string;
  score: number;
}

export interface Question {
  id: number;
  title: string;
  question: string;
  options: QuestionOption[];
}

export interface QuizData {
  title: string;
  description: string;
  questions: Question[];
  scoring: {
    ranges: {
      min: number;
      max: number;
      grade: "low" | "medium" | "high";
      label: string;
      description: string;
    }[];
  };
}

export interface QuizResult {
  totalScore: number;
  grade: "low" | "medium" | "high";
  label: string;
  description: string;
}
