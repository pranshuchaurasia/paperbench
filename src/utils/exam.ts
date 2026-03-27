// ================================================================
// FILE: src/utils/exam.ts
// PURPOSE: Shared helpers for flattening, indexing, and cloning exams.
// DEPENDENCIES: src/types
// ================================================================

import type { ExamConfig, Question, Section } from '../types';
import { shuffleArray } from './shuffle';

export interface IndexedQuestion {
  section: Section;
  question: Question;
}

/**
 * Return all questions in display order along with their parent section.
 *
 * @param config - Exam configuration.
 * @returns Flattened question list.
 */
export function flattenQuestions(config: ExamConfig): IndexedQuestion[] {
  return config.sections.flatMap((section) =>
    section.questions.map((question) => ({ section, question })),
  );
}

/**
 * Build a quick lookup map for question IDs.
 *
 * @param config - Exam configuration.
 * @returns Question metadata keyed by ID.
 */
export function buildQuestionMap(config: ExamConfig): Record<string, IndexedQuestion> {
  return Object.fromEntries(
    flattenQuestions(config).map((entry) => [entry.question.id, entry]),
  );
}

/**
 * Clone an exam while applying configured shuffling rules.
 *
 * @param config - Source exam configuration.
 * @returns Cloned exam with randomized question or option order.
 */
export function prepareExamConfig(config: ExamConfig): ExamConfig {
  const shuffleQuestions = config.settings.shuffle_questions ?? false;
  const shuffleOptions = config.settings.shuffle_options ?? false;

  const sections = config.sections.map((section) => {
    const questions = section.questions.map((question) => {
      if (!shuffleOptions) {
        return { ...question };
      }

      if (question.type === 'single_choice' || question.type === 'multiple_choice') {
        return {
          ...question,
          options: shuffleArray(question.options),
        };
      }

      return { ...question };
    });

    return {
      ...section,
      questions: shuffleQuestions ? shuffleArray(questions) : questions,
    };
  });

  return {
    ...config,
    sections,
  };
}
