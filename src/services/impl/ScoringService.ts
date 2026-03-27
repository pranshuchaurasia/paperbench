// ================================================================
// FILE: src/services/impl/ScoringService.ts
// PURPOSE: Implements IScoringService. Calculates exam scores.
// DEPENDENCIES: src/services/interfaces, src/utils/exam, src/types
// ================================================================

import type {
  ExamConfig,
  ExamResult,
  MultipleChoiceQuestion,
  Question,
  QuestionResult,
  SectionScore,
  UserAnswer,
} from '../../types';
import { isAnswerFilled } from '../../utils/answers';
import { flattenQuestions } from '../../utils/exam';
import type { IScoringService } from '../interfaces';

/**
 * ScoringService applies the PaperBench scoring rules.
 */
export class ScoringService implements IScoringService {
  /**
   * Calculate the full result for an exam attempt.
   *
   * @param config - Exam configuration.
   * @param answers - User answers keyed by question id.
   * @param timeTakenSeconds - Time spent before submission.
   * @returns Computed result breakdown.
   */
  calculateResults(
    config: ExamConfig,
    answers: Record<string, UserAnswer>,
    timeTakenSeconds: number,
  ): ExamResult {
    const sectionScores = new Map<string, SectionScore>();
    const questionResults: QuestionResult[] = [];
    let totalScore = 0;
    let totalPossibleScore = 0;

    for (const { section, question } of flattenQuestions(config)) {
      const answer = answers[question.id];
      const wasAnswered = isAnswerFilled(answer);
      const pointsPossible = question.type === 'type_answer' ? null : question.points;
      const sectionScore = sectionScores.get(section.name) ?? {
        sectionName: section.name,
        earned: 0,
        possible: 0,
      };

      if (question.type !== 'type_answer') {
        totalPossibleScore += question.points;
        sectionScore.possible += question.points;
      }

      if (!wasAnswered) {
        sectionScores.set(section.name, sectionScore);
        questionResults.push({
          questionId: question.id,
          sectionName: section.name,
          questionText: question.question,
          type: question.type,
          difficulty: question.difficulty,
          pointsEarned: question.type === 'type_answer' ? null : 0,
          pointsPossible,
          isCorrect: null,
          wasAnswered: false,
          status: 'unanswered',
          userAnswer: null,
          correctAnswer: this.getCorrectAnswer(question),
          tags: question.tags ?? [],
        });
        continue;
      }

      const scored = this.scoreQuestion(question, answer, config);
      if (scored.earned != null) {
        totalScore += scored.earned;
        sectionScore.earned += scored.earned;
      }

      sectionScores.set(section.name, sectionScore);
      questionResults.push({
        questionId: question.id,
        sectionName: section.name,
        questionText: question.question,
        type: question.type,
        difficulty: question.difficulty,
        pointsEarned: scored.earned,
        pointsPossible,
        isCorrect: scored.isCorrect,
        wasAnswered: true,
        status: scored.status,
        userAnswer: answer,
        correctAnswer: this.getCorrectAnswer(question),
        tags: question.tags ?? [],
      });
    }

    totalScore = Math.max(totalScore, 0);
    const percentage = totalPossibleScore === 0 ? 0 : Number(((totalScore / totalPossibleScore) * 100).toFixed(1));
    const passPercentage = config.settings.pass_percentage ?? null;

    return {
      totalScore,
      totalPossibleScore,
      percentage,
      passed: passPercentage == null ? null : percentage >= passPercentage,
      timeTakenSeconds,
      sectionScores: [...sectionScores.values()],
      questionResults,
    };
  }

  /**
   * Score a single question according to its type.
   */
  private scoreQuestion(
    question: Question,
    answer: UserAnswer,
    config: ExamConfig,
  ): { earned: number | null; isCorrect: boolean | null; status: QuestionResult['status'] } {
    if (question.type === 'type_answer') {
      return { earned: null, isCorrect: null, status: 'manual_review' };
    }

    let earned = 0;
    let isCorrect = false;

    switch (question.type) {
      case 'single_choice':
        isCorrect = answer.type === 'single_choice' && answer.selectedOptionId === question.correct_answer;
        earned = isCorrect ? question.points : 0;
        break;
      case 'true_false':
        isCorrect = answer.type === 'true_false' && answer.selectedValue === question.correct_answer;
        earned = isCorrect ? question.points : 0;
        break;
      case 'multiple_choice':
        ({ earned, isCorrect } = this.scoreMultipleChoice(question, answer));
        break;
      default:
        earned = 0;
    }

    if (!isCorrect) {
      earned = Math.max(0, earned - this.getNegativeMarkPenalty(question, config, answer));
    }

    return { earned, isCorrect, status: isCorrect ? 'correct' : 'incorrect' };
  }

  /**
   * Calculate the score for a multiple choice question.
   */
  private scoreMultipleChoice(
    question: MultipleChoiceQuestion,
    answer: UserAnswer,
  ): { earned: number; isCorrect: boolean } {
    if (answer.type !== 'multiple_choice') {
      return { earned: 0, isCorrect: false };
    }

    const selected = new Set(answer.selectedOptionIds);
    const correct = new Set(question.correct_answers);
    const incorrectOptions = question.options.filter((option) => !correct.has(option.id));
    const correctSelected = question.correct_answers.filter((id) => selected.has(id)).length;
    const incorrectSelected = incorrectOptions.filter((option) => selected.has(option.id)).length;
    const isExactMatch = selected.size === correct.size && question.correct_answers.every((id) => selected.has(id));

    if (!question.partial_credit) {
      return { earned: isExactMatch ? question.points : 0, isCorrect: isExactMatch };
    }

    const totalIncorrect = Math.max(incorrectOptions.length, 1);
    const rawScore = ((correctSelected / correct.size) * question.points)
      - ((incorrectSelected / totalIncorrect) * question.points);

    return {
      earned: Math.max(0, Math.round(rawScore)),
      isCorrect: isExactMatch,
    };
  }

  /**
   * Apply optional negative marking only to definitively wrong answers.
   */
  private getNegativeMarkPenalty(
    question: Question,
    config: ExamConfig,
    answer: UserAnswer,
  ): number {
    const negativeMarking = config.settings.negative_marking;
    if (!negativeMarking?.enabled) {
      return 0;
    }

    if (question.type === 'multiple_choice' && question.partial_credit && answer.type === 'multiple_choice') {
      const selected = new Set(answer.selectedOptionIds);
      const hasSomeCorrect = question.correct_answers.some((id) => selected.has(id));
      if (hasSomeCorrect) {
        return 0;
      }
    }

    if (negativeMarking.mode === 'percentage') {
      return question.points * ((negativeMarking.value ?? 0) / 100);
    }

    return negativeMarking.value ?? 0;
  }

  private getCorrectAnswer(question: Question): string | string[] | null {
    switch (question.type) {
      case 'single_choice':
      case 'true_false':
        return question.correct_answer;
      case 'multiple_choice':
        return question.correct_answers;
      case 'type_answer':
        return question.reference_answer ?? null;
      default:
        return null;
    }
  }
}
