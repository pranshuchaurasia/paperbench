// ================================================================
// FILE: src/types/storage.ts
// PURPOSE: Persistence layer types for active sessions and exam history.
// DEPENDENCIES: src/types/*
// ================================================================

import type { UserAnswer } from './answers';
import type { ExamConfig, SessionMode, ThemePreference } from './exam';
import type { ExamResult } from './results';

export interface ExamSession {
  id: string;
  examConfig: ExamConfig;
  imageMap: Record<string, string>;
  answers: Record<string, UserAnswer>;
  flaggedQuestions: string[];
  visitedQuestions: string[];
  questionOrder: string[];
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  perQuestionRemainingSeconds: Record<string, number>;
  examStartedAt: number | null;
  status: 'briefing' | 'in_progress';
  sessionMode?: SessionMode;
  timeLimitSeconds?: number | null;
}

export interface ExamHistoryEntry {
  id: string;
  examTitle: string;
  takenAt: string;
  result: ExamResult;
  answers: Record<string, UserAnswer>;
  config: ExamConfig;
  imageMap: Record<string, string>;
  questionOrder: string[];
  sessionMode?: SessionMode;
  timeLimitSeconds?: number | null;
}

export interface PreferenceRecord {
  key: 'theme';
  value: ThemePreference;
}

export interface ImageCacheRecord {
  url: string;
  dataUrl: string;
  cachedAt: string;
}
