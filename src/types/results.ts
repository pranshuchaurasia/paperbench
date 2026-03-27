// ================================================================
// FILE: src/types/results.ts
// PURPOSE: Score and review result types derived from completed exams.
// DEPENDENCIES: src/types/exam.ts, src/types/answers.ts
// ================================================================

import type { UserAnswer } from './answers';
import type { Difficulty, QuestionType } from './exam';

export interface SectionScore {
  sectionName: string;
  earned: number;
  possible: number;
}

export type ReviewStatus = 'correct' | 'incorrect' | 'unanswered' | 'manual_review';

export interface QuestionResult {
  questionId: string;
  sectionName: string;
  questionText: string;
  type: QuestionType;
  difficulty: Difficulty;
  pointsEarned: number | null;
  pointsPossible: number | null;
  isCorrect: boolean | null;
  wasAnswered: boolean;
  status: ReviewStatus;
  userAnswer: UserAnswer | null;
  correctAnswer: string | string[] | null;
  tags: string[];
}

export interface ExamResult {
  totalScore: number;
  totalPossibleScore: number;
  percentage: number;
  passed: boolean | null;
  timeTakenSeconds: number;
  sectionScores: SectionScore[];
  questionResults: QuestionResult[];
}
