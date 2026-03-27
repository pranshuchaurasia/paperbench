// ================================================================
// FILE: src/utils/questionFilter.ts
// PURPOSE: Filter questions for pre-exam configuration and diagnose empty results.
// DEPENDENCIES: src/types, src/utils/exam
// ================================================================

import type { DiagnosticMessage, Difficulty, ExamConfig, QuestionType } from '../types';
import type { IndexedQuestion } from './exam';
import { flattenQuestions } from './exam';

export interface QuestionFilters {
  difficulties: Difficulty[];
  topics: string[];
  types: QuestionType[];
}

const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const DIFFICULTY_SET = new Set(ALL_DIFFICULTIES);
const QUESTION_TYPES: QuestionType[] = ['single_choice', 'multiple_choice', 'true_false', 'type_answer'];

export function getAllIndexedQuestions(config: ExamConfig): IndexedQuestion[] {
  return flattenQuestions(config);
}

export function filterIndexedQuestions(
  questions: IndexedQuestion[],
  filters: QuestionFilters,
): IndexedQuestion[] {
  return questions.filter((entry) => (
    filters.difficulties.includes(entry.question.difficulty)
    && filters.types.includes(entry.question.type)
    && entry.question.tags.every((tag) => filters.topics.includes(tag))
  ));
}

export function buildCounts<T extends string>(items: T[]): Record<T, number> {
  return items.reduce((accumulator, item) => ({
    ...accumulator,
    [item]: (accumulator[item] ?? 0) + 1,
  }), {} as Record<T, number>);
}

export function getDifficultyCounts(questions: IndexedQuestion[]): Partial<Record<Difficulty, number>> {
  return buildCounts(questions.map((entry) => entry.question.difficulty));
}

export function getTypeCounts(questions: IndexedQuestion[]): Partial<Record<QuestionType, number>> {
  return buildCounts(questions.map((entry) => entry.question.type));
}

export function getTopicCounts(questions: IndexedQuestion[]): Record<string, number> {
  const counts: Record<string, number> = {};
  questions.forEach((entry) => {
    entry.question.tags.forEach((tag) => {
      counts[tag] = (counts[tag] ?? 0) + 1;
    });
  });
  return counts;
}

export function getUniqueTopics(questions: IndexedQuestion[]): string[] {
  return Object.keys(getTopicCounts(questions)).sort((left, right) => left.localeCompare(right));
}

export function getAvailableDifficulties(questions: IndexedQuestion[]): Difficulty[] {
  return ALL_DIFFICULTIES.filter((difficulty) => questions.some((entry) => entry.question.difficulty === difficulty));
}

export function getAvailableTypes(questions: IndexedQuestion[]): QuestionType[] {
  return QUESTION_TYPES.filter((type) => questions.some((entry) => entry.question.type === type));
}

export function clampQuestionCount(mode: 'all' | 'custom', customQuestionCount: number, matchingCount: number) {
  if (mode === 'all') {
    return matchingCount;
  }
  return Math.max(0, Math.min(customQuestionCount, matchingCount));
}

export function buildEmptyDiagnostic(
  allQuestions: IndexedQuestion[],
  filters: QuestionFilters,
): DiagnosticMessage {
  const withoutDifficulty = filterIndexedQuestions(allQuestions, {
    difficulties: ALL_DIFFICULTIES,
    topics: filters.topics,
    types: filters.types,
  });
  if (withoutDifficulty.length > 0) {
    const available = getAvailableDifficulties(withoutDifficulty);
    return {
      reason: `No ${filters.difficulties.join(', ')} questions exist for the selected topics and types.`,
      suggestion: `Try adding difficulty: ${available.join(', ')}.`,
      activeFilters: filters,
    };
  }

  const withoutTopics = filterIndexedQuestions(allQuestions, {
    difficulties: filters.difficulties,
    topics: getUniqueTopics(allQuestions),
    types: filters.types,
  });
  if (withoutTopics.length > 0) {
    const availableTopics = getUniqueTopics(withoutTopics).slice(0, 5);
    return {
      reason: `No questions with topics ${filters.topics.join(', ')} exist at the selected difficulty and type.`,
      suggestion: `Try adding topics: ${availableTopics.join(', ')}.`,
      activeFilters: filters,
    };
  }

  const withoutTypes = filterIndexedQuestions(allQuestions, {
    difficulties: filters.difficulties,
    topics: filters.topics,
    types: QUESTION_TYPES,
  });
  if (withoutTypes.length > 0) {
    const availableTypes = getAvailableTypes(withoutTypes);
    return {
      reason: `No ${filters.types.join(', ')} questions exist for the current topic and difficulty selection.`,
      suggestion: `Try adding question types: ${availableTypes.map(formatQuestionTypeLabel).join(', ')}.`,
      activeFilters: filters,
    };
  }

  return {
    reason: 'The combination of all selected filters matches nothing.',
    suggestion: 'Reset filters and start over.',
    activeFilters: filters,
  };
}

export function formatQuestionTypeLabel(type: QuestionType) {
  switch (type) {
    case 'single_choice':
      return 'Single Choice';
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'true_false':
      return 'True / False';
    case 'type_answer':
      return 'Type Answer';
    default:
      return type;
  }
}

export function isDifficultyTag(tag: string) {
  return DIFFICULTY_SET.has(tag as Difficulty);
}

