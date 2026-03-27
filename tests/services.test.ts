import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ExamStore } from '../src/store/examStore';
import {
  selectAllUniqueTopics,
  selectDifficultyCounts,
  selectFilteredQuestions,
  selectTopicCounts,
  selectTypeCounts,
} from '../src/store/examStore';
import { ClientExportService } from '../src/services/impl/ClientExportService';
import { ScoringService } from '../src/services/impl/ScoringService';
import { YamlParserService } from '../src/services/impl/YamlParserService';
import { frontendAssessmentYaml } from '../src/samples/frontendAssessment';
import { sampleExamLibrary } from '../src/samples/sampleLibrary';
import { buildEmptyDiagnostic, filterIndexedQuestions, getAllIndexedQuestions } from '../src/utils/questionFilter';

function createSelectorState(
  examYaml: string,
  overrides?: Partial<ExamStore['config']>,
): ExamStore {
  const parser = new YamlParserService();
  const config = parser.parse(examYaml);
  const allTopics = Array.from(new Set(config.sections.flatMap((section) => section.questions.flatMap((question) => question.tags)))).sort();

  return {
    sourceExamConfig: config,
    examConfig: config,
    config: {
      selectedDifficulties: ['easy', 'medium', 'hard'],
      selectedTopics: allTopics,
      selectedTypes: ['single_choice', 'multiple_choice', 'true_false', 'type_answer'],
      questionCountMode: 'all',
      customQuestionCount: config.sections.flatMap((section) => section.questions).length,
      sessionMode: 'timed',
      timerType: 'global',
      timeSource: 'yaml_default',
      customTotalMinutes: config.settings.total_time_minutes ?? 30,
      customPerQuestionSeconds: 60,
      ...overrides,
    },
  } as ExamStore;
}

describe('YamlParserService', () => {
  it('parses and validates the bundled sample exam', () => {
    const service = new YamlParserService();
    const config = service.parse(frontendAssessmentYaml);
    const report = service.validate(config);

    expect(config.exam.title).toBe('Frontend Developer Assessment');
    expect(report.isValid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it('validates every bundled sample exam in the sample library', () => {
    const service = new YamlParserService();
    for (const sample of sampleExamLibrary) {
      const config = service.parse(sample.yaml);
      const report = service.validate(config);
      expect(report.isValid, sample.title).toBe(true);
      expect(report.errors, sample.title).toHaveLength(0);
    }
  });

  it('rejects type_answer questions with points > 0', () => {
    const service = new YamlParserService();
    const config = service.parse(`exam:\n  title: Test\n  description: Demo\nsettings:\n  timer_mode: global\n  total_time_minutes: 10\nsections:\n  - name: Demo\n    questions:\n      - id: q1\n        type: type_answer\n        difficulty: hard\n        points: 1\n        question: Why?\n        tags: [writing]`);

    const report = service.validate(config);
    expect(report.isValid).toBe(false);
    expect(report.errors.some((error) => error.path.includes('points'))).toBe(true);
  });

  it('rejects duplicate option ids and missing multiple-choice answer mappings', () => {
    const service = new YamlParserService();
    const config = service.parse(`exam:\n  title: Test\n  description: Demo\nsettings:\n  timer_mode: global\n  total_time_minutes: 10\nsections:\n  - name: Demo\n    questions:\n      - id: q1\n        type: multiple_choice\n        difficulty: medium\n        points: 2\n        question: Pick all\n        tags: [css]\n        options:\n          - id: a\n            text: A\n          - id: a\n            text: Duplicate\n        correct_answers: [a, b]`);

    const report = service.validate(config);
    expect(report.isValid).toBe(false);
    expect(report.errors.some((error) => error.message.includes('Option ids must be unique'))).toBe(true);
    expect(report.errors.some((error) => error.message.includes('Each correct answer must match an option id'))).toBe(true);
  });

  it('rejects unsupported timer modes', () => {
    const service = new YamlParserService();
    const config = service.parse(`exam:\n  title: Test\n  description: Demo\nsettings:\n  timer_mode: weird\nsections:\n  - name: Demo\n    questions:\n      - id: q1\n        type: true_false\n        difficulty: easy\n        points: 1\n        question: Okay?\n        correct_answer: 'true'\n        tags: [checks]`);

    const report = service.validate(config);
    expect(report.isValid).toBe(false);
    expect(report.errors.some((error) => error.path === 'settings.timer_mode')).toBe(true);
  });

  it('rejects missing or invalid tags', () => {
    const service = new YamlParserService();
    const missingTags = service.parse(`exam:\n  title: Test\n  description: Demo\nsettings:\n  timer_mode: global\n  total_time_minutes: 5\nsections:\n  - name: Demo\n    questions:\n      - id: q1\n        type: true_false\n        difficulty: easy\n        points: 1\n        question: Tagged?\n        correct_answer: 'true'`);
    const invalidTags = service.parse(`exam:\n  title: Test\n  description: Demo\nsettings:\n  timer_mode: global\n  total_time_minutes: 5\nsections:\n  - name: Demo\n    questions:\n      - id: q1\n        type: true_false\n        difficulty: easy\n        points: 1\n        question: Tagged?\n        correct_answer: 'true'\n        tags: ['Fine Tuning']`);

    expect(service.validate(missingTags).errors.some((error) => error.path.endsWith('.tags'))).toBe(true);
    expect(service.validate(invalidTags).errors.some((error) => error.message.includes('lowercase kebab-case'))).toBe(true);
  });

  it('warns about difficulty-like tags but suppresses single-use tag noise', () => {
    const service = new YamlParserService();
    const config = service.parse(`exam:\n  title: Test\n  description: Demo\nsettings:\n  timer_mode: global\n  total_time_minutes: 5\nsections:\n  - name: Demo\n    questions:\n      - id: q1\n        type: true_false\n        difficulty: easy\n        points: 1\n        question: Tagged?\n        correct_answer: 'true'\n        tags: [easy]`);

    const report = service.validate(config);
    expect(report.warnings.some((warning) => warning.message.includes('matches a difficulty level'))).toBe(true);
    expect(report.warnings.some((warning) => warning.message.includes('used by only one question'))).toBe(false);
  });
});

describe('ScoringService', () => {
  it('calculates partial credit for multiple choice and ignores type_answer totals', () => {
    const parser = new YamlParserService();
    const scoring = new ScoringService();
    const config = parser.parse(frontendAssessmentYaml);
    const result = scoring.calculateResults(config, {
      'fe-1': { type: 'single_choice', selectedOptionId: 'b' },
      'fe-2': { type: 'multiple_choice', selectedOptionIds: ['a', 'd'] },
      'fe-3': { type: 'true_false', selectedValue: 'true' },
      'fe-4': { type: 'type_answer', text: 'Measure layout shifts, inspect breakpoints, and stabilize dimensions.' },
    }, 600);

    expect(result.totalPossibleScore).toBe(6);
    expect(result.totalScore).toBeGreaterThanOrEqual(5);
    expect(result.questionResults.find((item) => item.questionId === 'fe-4')?.pointsEarned).toBeNull();
  });
});

describe('Question filters', () => {
  it('filters by difficulty, topic, and type and diagnoses empty results', () => {
    const parser = new YamlParserService();
    const config = parser.parse(frontendAssessmentYaml);
    const questions = getAllIndexedQuestions(config);
    const filtered = filterIndexedQuestions(questions, {
      difficulties: ['medium'],
      topics: ['css', 'layout'],
      types: ['multiple_choice'],
    });
    const diagnostic = buildEmptyDiagnostic(questions, {
      difficulties: ['hard'],
      topics: ['forms'],
      types: ['multiple_choice'],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.question.id).toBe('fe-2');
    expect(diagnostic.reason.length).toBeGreaterThan(0);
    expect(diagnostic.suggestion.length).toBeGreaterThan(0);
  });

  it('derives topic-driven setup counts with deselected-tag exclusion semantics', () => {
    const state = createSelectorState(readFileSync('finetuning.yaml', 'utf8'));
    const allTopics = selectAllUniqueTopics(state);
    const withoutFineTuningState = createSelectorState(readFileSync('finetuning.yaml', 'utf8'), {
      selectedTopics: allTopics.filter((topic) => topic !== 'fine-tuning'),
    });
    const withoutDevelopmentFlowState = createSelectorState(readFileSync('finetuning.yaml', 'utf8'), {
      selectedTopics: allTopics.filter((topic) => topic !== 'development-flow'),
    });

    expect(selectFilteredQuestions(state)).toHaveLength(34);
    expect(selectTopicCounts(state)['fine-tuning']).toBe(28);
    expect(selectFilteredQuestions(withoutFineTuningState)).toHaveLength(6);
    expect(selectDifficultyCounts(withoutFineTuningState)).toEqual({ easy: 3, medium: 3, hard: 0 });
    expect(selectFilteredQuestions(withoutDevelopmentFlowState)).toHaveLength(28);
    expect(selectTypeCounts(withoutDevelopmentFlowState)).toEqual({
      single_choice: 16,
      multiple_choice: 3,
      true_false: 9,
      type_answer: 0,
    });
  });
});

describe('ClientExportService', () => {
  it('exports the docs guide as a standalone README', () => {
    const service = new ClientExportService();
    const readme = service.exportDocsAsReadme();

    expect(readme).toContain('PaperBench');
    expect(readme).toContain('## Configuring Your Session');
    expect(readme).toContain('Practice (untimed)');
    expect(readme).toContain('examples/frontend-assessment/exam.yaml');
  });
});

