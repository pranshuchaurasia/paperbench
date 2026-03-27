// ================================================================
// FILE: src/types/exam.ts
// PURPOSE: Domain types for YAML exams, sections, questions, and assets.
// DEPENDENCIES: None
// ================================================================

export type Difficulty = 'easy' | 'medium' | 'hard';
export type TimerMode = 'global' | 'per_question';
export type SessionMode = 'timed' | 'practice';
export type ThemePreference = 'dark' | 'light' | 'system';
export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'type_answer';

export interface ValidationError {
  path: string;
  message: string;
}

export interface DiagnosticMessage {
  reason: string;
  suggestion: string;
  activeFilters: {
    difficulties: Difficulty[];
    topics: string[];
    types: QuestionType[];
  };
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export type ImagePosition = 'below_question' | 'below_code' | 'above_options';

export interface QuestionImage {
  src: string;
  alt: string;
  width?: number;
  caption?: string;
  position?: ImagePosition;
}

export interface Option {
  id: string;
  text: string;
}

export interface QuestionBase {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  points: number;
  question: string;
  time_limit_seconds?: number;
  code_snippet?: CodeSnippet;
  image?: QuestionImage;
  explanation?: string;
  tags: string[];
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single_choice';
  options: Option[];
  correct_answer: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple_choice';
  options: Option[];
  correct_answers: string[];
  partial_credit?: boolean;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'true_false';
  correct_answer: 'true' | 'false';
}

export interface TypeAnswerQuestion extends QuestionBase {
  type: 'type_answer';
  points: 0;
  max_characters?: number;
  min_characters?: number;
  placeholder?: string;
  reference_answer?: string;
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | TypeAnswerQuestion;

export interface Section {
  name: string;
  description?: string;
  questions: Question[];
}

export interface NegativeMarkingConfig {
  enabled: boolean;
  mode?: 'fixed' | 'percentage';
  value?: number;
}

export interface ExamSettings {
  timer_mode: TimerMode;
  total_time_minutes?: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  allow_review?: boolean;
  show_correct_after_submit?: boolean;
  pass_percentage?: number | null;
  negative_marking?: NegativeMarkingConfig;
  theme?: ThemePreference;
}

export interface ExamMeta {
  title: string;
  description: string;
  version?: string;
  author?: string;
  created_at?: string;
}

export interface ExamConfig {
  exam: ExamMeta;
  settings: ExamSettings;
  sections: Section[];
}
