// ================================================================
// FILE: src/utils/backupGenerator.ts
// PURPOSE: Generate machine-readable all-history backup archives.
// DEPENDENCIES: js-yaml, src/types, src/utils/*
// ================================================================

import yaml from 'js-yaml';
import type { ExamHistoryEntry, UserAnswer } from '../types';
import { buildQuestionMap } from './exam';
import { sha256 } from './hash';

interface BackupAnswerRecord {
  question_id: string;
  type: string;
  selected?: string | string[];
  response?: string;
  correct?: string | string[];
  reference_answer?: string;
  is_correct: boolean | null;
  points_earned: number | null;
  points_possible: number | null;
}

function getAnswerPayload(answer: UserAnswer | undefined): Pick<BackupAnswerRecord, 'selected' | 'response'> {
  if (!answer) {
    return {};
  }
  if (answer.type === 'single_choice') {
    return { selected: answer.selectedOptionId };
  }
  if (answer.type === 'multiple_choice') {
    return { selected: answer.selectedOptionIds };
  }
  if (answer.type === 'true_false') {
    return { selected: answer.selectedValue };
  }
  return { response: answer.text };
}

export async function buildHistoryBackup(entries: ExamHistoryEntry[]) {
  const attempts = await Promise.all(entries.map(async (entry) => {
    const questionMap = buildQuestionMap(entry.config);
    const answers = entry.result.questionResults.map<BackupAnswerRecord>((questionResult) => {
      const question = questionMap[questionResult.questionId]?.question;
      const answerPayload = getAnswerPayload(entry.answers[questionResult.questionId]);
      const correct = question?.type === 'single_choice' || question?.type === 'true_false'
        ? question.correct_answer
        : question?.type === 'multiple_choice'
          ? question.correct_answers
          : undefined;
      const referenceAnswer = question?.type === 'type_answer' ? question.reference_answer : undefined;

      return {
        question_id: questionResult.questionId,
        type: questionResult.type,
        ...answerPayload,
        correct,
        reference_answer: referenceAnswer,
        is_correct: questionResult.isCorrect,
        points_earned: questionResult.pointsEarned,
        points_possible: questionResult.pointsPossible,
      };
    });

    return {
      id: entry.id,
      exam_title: entry.examTitle,
      exam_version: entry.config.exam.version ?? 'unknown',
      exam_yaml_hash: `sha256:${await sha256(JSON.stringify(entry.config))}`,
      date_taken: entry.takenAt,
      time_taken_seconds: entry.result.timeTakenSeconds,
      timer_mode: entry.config.settings.timer_mode,
      score: {
        total: entry.result.totalScore,
        possible: entry.result.totalPossibleScore,
        percentage: entry.result.percentage,
        passed: entry.result.passed,
        pass_threshold: entry.config.settings.pass_percentage ?? null,
      },
      answers,
      section_scores: entry.result.sectionScores.map((section) => ({
        name: section.sectionName,
        score: section.earned,
        possible: section.possible,
        percentage: section.possible > 0 ? Number(((section.earned / section.possible) * 100).toFixed(1)) : 0,
      })),
    };
  }));

  return {
    paperbench_backup: {
      version: '1.0',
      exported_at: new Date().toISOString(),
      total_attempts: entries.length,
      attempts,
    },
  };
}

export async function generateBackupFile(entries: ExamHistoryEntry[], format: 'json' | 'yaml') {
  const payload = await buildHistoryBackup(entries);
  const dateSuffix = new Date().toISOString().slice(0, 10);

  if (format === 'json') {
    return {
      filename: `paperbench-backup-${dateSuffix}.json`,
      blob: new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    };
  }

  return {
    filename: `paperbench-backup-${dateSuffix}.yaml`,
    blob: new Blob([yaml.dump(payload, { noRefs: true })], { type: 'application/x-yaml' }),
  };
}

export function downloadBackupFile(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

