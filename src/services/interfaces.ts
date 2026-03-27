// ================================================================
// FILE: src/services/interfaces.ts
// PURPOSE: Contracts for all injectable services.
// DEPENDENCIES: src/types
// ================================================================

import type {
  ExamConfig,
  ExamHistoryEntry,
  ExamResult,
  ExamSession,
  ThemePreference,
  UserAnswer,
  ValidationError,
} from '../types';

export interface FileExportResult {
  blob: Blob;
  extension: string;
  mimeType: string;
}

export interface IYamlParserService {
  parse(yamlString: string): ExamConfig;
  validate(config: ExamConfig): {
    errors: ValidationError[];
    warnings: ValidationError[];
    isValid: boolean;
  };
}

export interface IScoringService {
  calculateResults(
    config: ExamConfig,
    answers: Record<string, UserAnswer>,
    timeTakenSeconds: number,
  ): ExamResult;
}

export interface IStorageService {
  saveExamSession(session: ExamSession): Promise<void>;
  loadExamSession(): Promise<ExamSession | null>;
  clearExamSession(): Promise<void>;
  saveToHistory(result: ExamHistoryEntry): Promise<void>;
  loadHistory(): Promise<ExamHistoryEntry[]>;
  loadFullHistory(): Promise<ExamHistoryEntry[]>;
  deleteHistoryEntry(id: string): Promise<void>;
  saveThemePreference(theme: ThemePreference): Promise<void>;
  loadThemePreference(): Promise<ThemePreference | null>;
}

export interface ITimerService {
  start(
    durationSeconds: number,
    onTick: (remaining: number) => void,
    onExpire: () => void,
  ): void;
  pause(): void;
  resume(): void;
  stop(): void;
  getRemaining(): number;
}

export interface IExportService {
  exportAsMarkdown(
    config: ExamConfig,
    result: ExamResult,
    answers: Record<string, UserAnswer>,
    imageMap: Record<string, string>,
  ): Promise<FileExportResult>;
  exportAsYaml(
    config: ExamConfig,
    result: ExamResult,
    answers: Record<string, UserAnswer>,
  ): Promise<FileExportResult>;
  exportAsPdf(targetElementId: string, filename: string): Promise<void>;
  exportDocsAsReadme(): string;
}
