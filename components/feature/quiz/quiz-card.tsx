import { Card } from "@/components/ui/card";
import QuizCardHeader from "./quiz-card-header";
import QuizCardContent from "./quiz-card-content";
import QuizCardFooter from "./quiz-card-footer";
import type { Question } from "@/types/quiz";

// 測驗卡片元件 Props
export interface QuizCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswer: (answer: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
}

export default function QuizCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isLastQuestion,
}: QuizCardProps) {
  return (
    <Card>
      <QuizCardHeader
        questionTitle={question.title}
        question={question.question}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
      />
      <QuizCardContent
        options={question.options}
        selectedAnswer={selectedAnswer}
        onAnswer={onAnswer}
      />
      <QuizCardFooter
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isLastQuestion={isLastQuestion}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </Card>
  );
}
