// ================================================================
// FILE: src/store/examStore.ts
// PURPOSE: Central state for exam lifecycle and pre-exam configuration.
// NOTE: Setup-page filtering is derived through selectors rather than cached fields.
// ================================================================

import { create } from 'zustand';
import type {
  DiagnosticMessage,
  Difficulty,
  ExamConfig,
  ExamHistoryEntry,
  ExamResult,
  ExamSession,
  QuestionType,
  SessionMode,
  TimerMode,
  UserAnswer,
  ValidationError,
} from '../types';
import { getServiceContainer } from '../services/ServiceProvider';
import { downloadBackupFile, generateBackupFile } from '../utils/backupGenerator';
import { flattenQuestions, prepareExamConfig, type IndexedQuestion } from '../utils/exam';
import {
  buildEmptyDiagnostic,
  clampQuestionCount,
  filterIndexedQuestions,
  getAllIndexedQuestions,
  getAvailableDifficulties,
  getAvailableTypes,
  getUniqueTopics,
} from '../utils/questionFilter';
import { shuffleArray } from '../utils/shuffle';

function hasUploadedImageSource(path: string, imageMap: Record<string, string>) {
  return Boolean(imageMap[path] ?? imageMap[path.replace(/^\.?\//, '')]);
}

function createEmptyConfig() {
  return {
    selectedDifficulties: [] as Difficulty[],
    selectedTopics: [] as string[],
    selectedTypes: [] as QuestionType[],
    questionCountMode: 'all' as const,
    customQuestionCount: 0,
    sessionMode: 'timed' as SessionMode,
    timerType: 'global' as TimerMode,
    timeSource: 'yaml_default' as const,
    customTotalMinutes: 0,
    customPerQuestionSeconds: 60,
  };
}

function createDefaultConfig(examConfig: ExamConfig) {
  const questions = getAllIndexedQuestions(examConfig);
  const selectedDifficulties = getAvailableDifficulties(questions);
  const selectedTopics = getUniqueTopics(questions);
  const selectedTypes = getAvailableTypes(questions);
  const firstQuestionSeconds = questions[0]?.question.time_limit_seconds ?? 60;

  return {
    selectedDifficulties,
    selectedTopics,
    selectedTypes,
    questionCountMode: 'all' as const,
    customQuestionCount: questions.length,
    sessionMode: 'timed' as SessionMode,
    timerType: examConfig.settings.timer_mode,
    timeSource: 'yaml_default' as const,
    customTotalMinutes: examConfig.settings.total_time_minutes ?? Math.max(1, questions.length),
    customPerQuestionSeconds: firstQuestionSeconds,
  };
}

function buildConfiguredExam(
  sourceExamConfig: ExamConfig,
  filteredQuestions: IndexedQuestion[],
  config: ExamStore['config'],
) {
  const matchingCount = filteredQuestions.length;
  const finalCount = clampQuestionCount(config.questionCountMode, config.customQuestionCount, matchingCount);
  const selectedQuestions = config.questionCountMode === 'custom'
    ? shuffleArray(filteredQuestions).slice(0, finalCount)
    : filteredQuestions;

  const selectedIds = new Set(selectedQuestions.map((entry) => entry.question.id));
  const timerType = config.sessionMode === 'practice'
    ? config.timerType
    : config.timeSource === 'yaml_default'
      ? sourceExamConfig.settings.timer_mode
      : config.timerType;

  const customPerQuestionSeconds = Math.max(5, config.customPerQuestionSeconds);
  const configuredSections = sourceExamConfig.sections
    .map((section) => ({
      ...section,
      questions: section.questions
        .filter((question) => selectedIds.has(question.id))
        .map((question) => ({
          ...question,
          time_limit_seconds: timerType === 'per_question'
            ? (config.timeSource === 'custom' ? customPerQuestionSeconds : question.time_limit_seconds ?? 60)
            : question.time_limit_seconds,
        })),
    }))
    .filter((section) => section.questions.length > 0);

  const configuredExam: ExamConfig = {
    ...sourceExamConfig,
    settings: {
      ...sourceExamConfig.settings,
      allow_review: config.sessionMode === 'practice' ? true : sourceExamConfig.settings.allow_review,
      timer_mode: timerType,
      total_time_minutes: timerType === 'global'
        ? (config.timeSource === 'custom' ? Math.max(1, config.customTotalMinutes) : sourceExamConfig.settings.total_time_minutes)
        : undefined,
    },
    sections: configuredSections,
  };

  const configuredEntries = flattenQuestions(configuredExam);
  const selectedOrder = selectedQuestions.map((entry) => entry.question.id);
  const questionOrder = selectedOrder.filter((questionId) => configuredEntries.some((entry) => entry.question.id === questionId));
  const perQuestionRemainingSeconds = Object.fromEntries(
    configuredEntries.map(({ question }) => [question.id, question.time_limit_seconds ?? customPerQuestionSeconds]),
  );
  const firstQuestionId = questionOrder[0];
  const totalSeconds = timerType === 'global'
    ? Math.max(1, (configuredExam.settings.total_time_minutes ?? 1) * 60)
    : perQuestionRemainingSeconds[firstQuestionId] ?? customPerQuestionSeconds;

  return {
    configuredExam,
    questionOrder,
    perQuestionRemainingSeconds,
    totalSeconds,
    timeLimitSeconds: config.sessionMode === 'practice'
      ? null
      : timerType === 'global'
        ? totalSeconds
        : null,
  };
}

export interface ExamStore {
  sourceExamConfig: ExamConfig | null;
  examConfig: ExamConfig | null;
  imageMap: Record<string, string>;
  status: 'idle' | 'uploading' | 'briefing' | 'in_progress' | 'submitted' | 'reviewing';
  currentQuestionIndex: number;
  answers: Record<string, UserAnswer>;
  flaggedQuestions: string[];
  visitedQuestions: string[];
  questionOrder: string[];
  timeRemainingSeconds: number;
  perQuestionRemainingSeconds: Record<string, number>;
  examStartedAt: number | null;
  results: ExamResult | null;
  validationWarnings: ValidationError[];
  sessionMode: SessionMode;
  timeLimitSeconds: number | null;
  config: {
    selectedDifficulties: Difficulty[];
    selectedTopics: string[];
    selectedTypes: QuestionType[];
    questionCountMode: 'all' | 'custom';
    customQuestionCount: number;
    sessionMode: SessionMode;
    timerType: TimerMode;
    timeSource: 'yaml_default' | 'custom';
    customTotalMinutes: number;
    customPerQuestionSeconds: number;
  };
  loadExam: (yamlString: string, imageMap: Record<string, string>) => ValidationError[];
  startExam: () => boolean;
  applyConfigAndStart: () => boolean;
  setDifficulties: (diffs: Difficulty[]) => void;
  setTopics: (topics: string[]) => void;
  setTypes: (types: QuestionType[]) => void;
  setQuestionCountMode: (mode: 'all' | 'custom') => void;
  setCustomQuestionCount: (count: number) => void;
  setSessionMode: (mode: SessionMode) => void;
  setTimerType: (type: TimerMode) => void;
  setTimeSource: (source: 'yaml_default' | 'custom') => void;
  setCustomTotalMinutes: (minutes: number) => void;
  setCustomPerQuestionSeconds: (seconds: number) => void;
  resetConfig: () => void;
  answerQuestion: (questionId: string, answer: UserAnswer) => void;
  toggleFlag: (questionId: string) => void;
  navigateTo: (index: number) => void;
  setTimeRemaining: (seconds: number) => void;
  setPerQuestionTimeRemaining: (questionId: string, seconds: number) => void;
  submitExam: () => Promise<void>;
  resetExam: () => Promise<void>;
  hydrateSession: (session: ExamSession) => void;
  loadHistoryEntry: (entry: ExamHistoryEntry) => void;
  exportAllHistory: (format: 'json' | 'yaml') => Promise<void>;
}

function getSetupConfig(state: ExamStore) {
  return state.sourceExamConfig ?? state.examConfig;
}

function getQuestionFilters(state: ExamStore) {
  return {
    difficulties: state.config.selectedDifficulties,
    topics: state.config.selectedTopics,
    types: state.config.selectedTypes,
  };
}

const emptyIndexedQuestions: IndexedQuestion[] = [];
const emptySections: { name: string; questionCount: number; points: number }[] = [];
const emptyTopics: string[] = [];
const emptyDifficultyCounts: Partial<Record<Difficulty, number>> = { easy: 0, medium: 0, hard: 0 };
const emptyTypeCounts: Partial<Record<QuestionType, number>> = {
  single_choice: 0,
  multiple_choice: 0,
  true_false: 0,
  type_answer: 0,
};
const emptyTopicCounts: Record<string, number> = {};

export const selectAllIndexedQuestions = (() => {
  let lastConfig: ExamConfig | null = null;
  let lastResult = emptyIndexedQuestions;

  return (state: ExamStore): IndexedQuestion[] => {
    const config = getSetupConfig(state);
    if (!config) {
      return emptyIndexedQuestions;
    }
    if (config === lastConfig) {
      return lastResult;
    }

    lastConfig = config;
    lastResult = getAllIndexedQuestions(config);
    return lastResult;
  };
})();

export const selectAllUniqueTopics = (() => {
  let lastQuestions = emptyIndexedQuestions;
  let lastResult = emptyTopics;

  return (state: ExamStore): string[] => {
    const questions = selectAllIndexedQuestions(state);
    if (questions === lastQuestions) {
      return lastResult;
    }

    lastQuestions = questions;
    lastResult = getUniqueTopics(questions);
    return lastResult;
  };
})();

export const selectAvailableDifficulties = (() => {
  let lastQuestions = emptyIndexedQuestions;
  let lastResult: Difficulty[] = [];

  return (state: ExamStore): Difficulty[] => {
    const questions = selectAllIndexedQuestions(state);
    if (questions === lastQuestions) {
      return lastResult;
    }

    lastQuestions = questions;
    lastResult = getAvailableDifficulties(questions);
    return lastResult;
  };
})();

export const selectAvailableTypes = (() => {
  let lastQuestions = emptyIndexedQuestions;
  let lastResult: QuestionType[] = [];

  return (state: ExamStore): QuestionType[] => {
    const questions = selectAllIndexedQuestions(state);
    if (questions === lastQuestions) {
      return lastResult;
    }

    lastQuestions = questions;
    lastResult = getAvailableTypes(questions);
    return lastResult;
  };
})();

export const selectFilteredQuestions = (() => {
  let lastQuestions = emptyIndexedQuestions;
  let lastDifficulties: Difficulty[] = [];
  let lastTopics: string[] = [];
  let lastTypes: QuestionType[] = [];
  let lastResult = emptyIndexedQuestions;

  return (state: ExamStore): IndexedQuestion[] => {
    const questions = selectAllIndexedQuestions(state);
    const { selectedDifficulties, selectedTopics, selectedTypes } = state.config;

    if (
      questions === lastQuestions
      && selectedDifficulties === lastDifficulties
      && selectedTopics === lastTopics
      && selectedTypes === lastTypes
    ) {
      return lastResult;
    }

    lastQuestions = questions;
    lastDifficulties = selectedDifficulties;
    lastTopics = selectedTopics;
    lastTypes = selectedTypes;
    lastResult = questions.length === 0
      ? emptyIndexedQuestions
      : filterIndexedQuestions(questions, getQuestionFilters(state));

    return lastResult;
  };
})();

export const selectFinalQuestionCount = (state: ExamStore): number => clampQuestionCount(
  state.config.questionCountMode,
  state.config.customQuestionCount,
  selectFilteredQuestions(state).length,
);

export const selectFilteredSections = (() => {
  let lastConfig: ExamConfig | null = null;
  let lastDifficulties: Difficulty[] = [];
  let lastTopics: string[] = [];
  let lastTypes: QuestionType[] = [];
  let lastResult = emptySections;

  return (state: ExamStore) => {
    const config = getSetupConfig(state);
    if (!config) {
      return emptySections;
    }

    const filters = getQuestionFilters(state);
    if (
      config === lastConfig
      && filters.difficulties === lastDifficulties
      && filters.topics === lastTopics
      && filters.types === lastTypes
    ) {
      return lastResult;
    }

    lastConfig = config;
    lastDifficulties = filters.difficulties;
    lastTopics = filters.topics;
    lastTypes = filters.types;
    lastResult = config.sections
      .map((section) => {
        const filteredQuestions = section.questions.filter((question) => (
          filters.difficulties.includes(question.difficulty)
          && filters.types.includes(question.type)
          && question.tags.every((tag) => filters.topics.includes(tag))
        ));
        return {
          name: section.name,
          questionCount: filteredQuestions.length,
          points: filteredQuestions.reduce(
            (sum, question) => sum + (question.type === 'type_answer' ? 0 : question.points),
            0,
          ),
        };
      })
      .filter((section) => section.questionCount > 0);

    return lastResult;
  };
})();

export const selectDifficultyCounts = (() => {
  let lastQuestions = emptyIndexedQuestions;
  let lastTopics: string[] = [];
  let lastTypes: QuestionType[] = [];
  let lastResult = emptyDifficultyCounts;

  return (state: ExamStore): Partial<Record<Difficulty, number>> => {
    const questions = selectAllIndexedQuestions(state);
    const { selectedTopics, selectedTypes } = state.config;

    if (
      questions === lastQuestions
      && selectedTopics === lastTopics
      && selectedTypes === lastTypes
    ) {
      return lastResult;
    }

    lastQuestions = questions;
    lastTopics = selectedTopics;
    lastTypes = selectedTypes;
    const filtered = questions.filter((entry) => (
      entry.question.tags.every((tag) => selectedTopics.includes(tag))
      && selectedTypes.includes(entry.question.type)
    ));

    lastResult = {
      easy: filtered.filter((entry) => entry.question.difficulty === 'easy').length,
      medium: filtered.filter((entry) => entry.question.difficulty === 'medium').length,
      hard: filtered.filter((entry) => entry.question.difficulty === 'hard').length,
    };

    return lastResult;
  };
})();

export const selectTypeCounts = (() => {
  let lastQuestions = emptyIndexedQuestions;
  let lastDifficulties: Difficulty[] = [];
  let lastTopics: string[] = [];
  let lastResult = emptyTypeCounts;

  return (state: ExamStore): Partial<Record<QuestionType, number>> => {
    const questions = selectAllIndexedQuestions(state);
    const { selectedDifficulties, selectedTopics } = state.config;

    if (
      questions === lastQuestions
      && selectedDifficulties === lastDifficulties
      && selectedTopics === lastTopics
    ) {
      return lastResult;
    }

    lastQuestions = questions;
    lastDifficulties = selectedDifficulties;
    lastTopics = selectedTopics;
    const filtered = questions.filter((entry) => (
      selectedDifficulties.includes(entry.question.difficulty)
      && entry.question.tags.every((tag) => selectedTopics.includes(tag))
    ));

    lastResult = {
      single_choice: filtered.filter((entry) => entry.question.type === 'single_choice').length,
      multiple_choice: filtered.filter((entry) => entry.question.type === 'multiple_choice').length,
      true_false: filtered.filter((entry) => entry.question.type === 'true_false').length,
      type_answer: filtered.filter((entry) => entry.question.type === 'type_answer').length,
    };

    return lastResult;
  };
})();

export const selectTopicCounts = (() => {
  let lastQuestions = emptyIndexedQuestions;
  let lastDifficulties: Difficulty[] = [];
  let lastTypes: QuestionType[] = [];
  let lastResult = emptyTopicCounts;

  return (state: ExamStore): Record<string, number> => {
    const questions = selectAllIndexedQuestions(state);
    const { selectedDifficulties, selectedTypes } = state.config;

    if (
      questions === lastQuestions
      && selectedDifficulties === lastDifficulties
      && selectedTypes === lastTypes
    ) {
      return lastResult;
    }

    lastQuestions = questions;
    lastDifficulties = selectedDifficulties;
    lastTypes = selectedTypes;
    const counts: Record<string, number> = {};
    const filtered = questions.filter((entry) => (
      selectedDifficulties.includes(entry.question.difficulty)
      && selectedTypes.includes(entry.question.type)
    ));

    filtered.forEach((entry) => {
      const uniqueTags = new Set(entry.question.tags);
      uniqueTags.forEach((tag) => {
        counts[tag] = (counts[tag] ?? 0) + 1;
      });
    });

    lastResult = counts;
    return lastResult;
  };
})();

export const selectFilterDiagnostic = (() => {
  let lastQuestions = emptyIndexedQuestions;
  let lastFiltered = emptyIndexedQuestions;
  let lastDifficulties: Difficulty[] = [];
  let lastTopics: string[] = [];
  let lastTypes: QuestionType[] = [];
  let lastResult: DiagnosticMessage | null = null;

  return (state: ExamStore): DiagnosticMessage | null => {
    const config = getSetupConfig(state);
    if (!config) {
      return null;
    }

    const questions = selectAllIndexedQuestions(state);
    const filteredQuestions = selectFilteredQuestions(state);
    const filters = getQuestionFilters(state);

    if (
      questions === lastQuestions
      && filteredQuestions === lastFiltered
      && filters.difficulties === lastDifficulties
      && filters.topics === lastTopics
      && filters.types === lastTypes
    ) {
      return lastResult;
    }

    lastQuestions = questions;
    lastFiltered = filteredQuestions;
    lastDifficulties = filters.difficulties;
    lastTopics = filters.topics;
    lastTypes = filters.types;
    lastResult = filteredQuestions.length > 0
      ? null
      : buildEmptyDiagnostic(questions, filters);

    return lastResult;
  };
})();

export const useExamStore = create<ExamStore>((set, get) => ({
  sourceExamConfig: null,
  examConfig: null,
  imageMap: {},
  status: 'idle',
  currentQuestionIndex: 0,
  answers: {},
  flaggedQuestions: [],
  visitedQuestions: [],
  questionOrder: [],
  timeRemainingSeconds: 0,
  perQuestionRemainingSeconds: {},
  examStartedAt: null,
  results: null,
  validationWarnings: [],
  sessionMode: 'timed',
  timeLimitSeconds: null,
  config: createEmptyConfig(),
  loadExam: (yamlString, imageMap) => {
    const { yamlParser } = getServiceContainer();
    const parsed = yamlParser.parse(yamlString);
    const report = yamlParser.validate(parsed);
    if (!report.isValid) {
      throw new Error(report.errors.map((error) => `${error.path}: ${error.message}`).join('\n'));
    }

    const filteredWarnings = report.warnings.filter((warning) => {
      if (!warning.path.endsWith('.image.src')) {
        return true;
      }

      const matches = warning.path.match(/sections\[(\d+)\]\.questions\[(\d+)\]\.image\.src/);
      if (!matches) {
        return true;
      }

      const section = parsed.sections[Number(matches[1])];
      const question = section?.questions[Number(matches[2])];
      const imageSrc = question?.image?.src;
      if (!imageSrc) {
        return true;
      }

      return !hasUploadedImageSource(imageSrc, imageMap);
    });

    const sourceExamConfig = prepareExamConfig(parsed);
    const config = createDefaultConfig(sourceExamConfig);

    set({
      sourceExamConfig,
      examConfig: sourceExamConfig,
      imageMap,
      status: 'briefing',
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: [],
      visitedQuestions: [],
      questionOrder: [],
      timeRemainingSeconds: 0,
      perQuestionRemainingSeconds: {},
      examStartedAt: null,
      results: null,
      validationWarnings: filteredWarnings,
      sessionMode: config.sessionMode,
      timeLimitSeconds: null,
      config,
    });

    return filteredWarnings;
  },
  startExam: () => get().applyConfigAndStart(),
  applyConfigAndStart: () => {
    const state = get();
    if (!state.sourceExamConfig) {
      return false;
    }

    const filteredQuestions = selectFilteredQuestions(state);
    if (filteredQuestions.length === 0) {
      return false;
    }

    const {
      configuredExam,
      questionOrder,
      perQuestionRemainingSeconds,
      totalSeconds,
      timeLimitSeconds,
    } = buildConfiguredExam(state.sourceExamConfig, filteredQuestions, state.config);

    const firstQuestionId = questionOrder[0];
    if (!firstQuestionId) {
      return false;
    }

    set({
      examConfig: configuredExam,
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: [],
      visitedQuestions: [firstQuestionId],
      questionOrder,
      timeRemainingSeconds: state.config.sessionMode === 'practice' ? -1 : totalSeconds,
      perQuestionRemainingSeconds,
      examStartedAt: Date.now(),
      results: null,
      sessionMode: state.config.sessionMode,
      timeLimitSeconds,
    });

    return true;
  },
  setDifficulties: (diffs) => set((state) => ({
    config: { ...state.config, selectedDifficulties: [...diffs] },
  })),
  setTopics: (topics) => set((state) => ({
    config: { ...state.config, selectedTopics: [...topics] },
  })),
  setTypes: (types) => set((state) => ({
    config: { ...state.config, selectedTypes: [...types] },
  })),
  setQuestionCountMode: (mode) => set((state) => ({
    config: {
      ...state.config,
      questionCountMode: mode,
    },
  })),
  setCustomQuestionCount: (count) => set((state) => ({
    config: {
      ...state.config,
      customQuestionCount: Math.max(1, count),
    },
  })),
  setSessionMode: (mode) => set((state) => ({
    sessionMode: mode,
    config: {
      ...state.config,
      sessionMode: mode,
    },
  })),
  setTimerType: (type) => set((state) => ({
    config: {
      ...state.config,
      timerType: type,
    },
  })),
  setTimeSource: (source) => set((state) => ({
    config: {
      ...state.config,
      timeSource: source,
    },
  })),
  setCustomTotalMinutes: (minutes) => set((state) => ({
    config: {
      ...state.config,
      customTotalMinutes: Math.max(1, minutes),
    },
  })),
  setCustomPerQuestionSeconds: (seconds) => set((state) => ({
    config: {
      ...state.config,
      customPerQuestionSeconds: Math.max(5, seconds),
    },
  })),
  resetConfig: () => set((state) => ({
    config: state.sourceExamConfig ? createDefaultConfig(state.sourceExamConfig) : createEmptyConfig(),
    sessionMode: 'timed',
  })),
  answerQuestion: (questionId, answer) => set((state) => ({
    answers: { ...state.answers, [questionId]: answer },
    visitedQuestions: state.visitedQuestions.includes(questionId)
      ? state.visitedQuestions
      : [...state.visitedQuestions, questionId],
  })),
  toggleFlag: (questionId) => set((state) => ({
    flaggedQuestions: state.flaggedQuestions.includes(questionId)
      ? state.flaggedQuestions.filter((id) => id !== questionId)
      : [...state.flaggedQuestions, questionId],
  })),
  navigateTo: (index) => set((state) => {
    const maxIndex = state.questionOrder.length - 1;
    const bounded = Math.max(0, Math.min(index, maxIndex));
    const allowReview = state.examConfig?.settings.allow_review ?? true;
    const targetIndex = allowReview ? bounded : Math.min(Math.max(bounded, state.currentQuestionIndex), state.currentQuestionIndex + 1);
    const questionId = state.questionOrder[targetIndex];
    return {
      currentQuestionIndex: targetIndex,
      visitedQuestions: state.visitedQuestions.includes(questionId)
        ? state.visitedQuestions
        : [...state.visitedQuestions, questionId],
      timeRemainingSeconds: state.examConfig?.settings.timer_mode === 'per_question' && state.sessionMode !== 'practice'
        ? state.perQuestionRemainingSeconds[questionId] ?? 60
        : state.timeRemainingSeconds,
    };
  }),
  setTimeRemaining: (seconds) => set({ timeRemainingSeconds: Math.max(0, seconds) }),
  setPerQuestionTimeRemaining: (questionId, seconds) => set((state) => ({
    perQuestionRemainingSeconds: {
      ...state.perQuestionRemainingSeconds,
      [questionId]: Math.max(0, seconds),
    },
    timeRemainingSeconds: state.questionOrder[state.currentQuestionIndex] === questionId
      ? Math.max(0, seconds)
      : state.timeRemainingSeconds,
  })),
  submitExam: async () => {
    const state = get();
    if (!state.examConfig || state.examStartedAt == null) {
      return;
    }

    const { scoring, storage } = getServiceContainer();
    const timeTakenSeconds = Math.max(0, Math.round((Date.now() - state.examStartedAt) / 1000));
    const results = scoring.calculateResults(state.examConfig, state.answers, timeTakenSeconds);

    await storage.saveToHistory({
      id: crypto.randomUUID(),
      examTitle: state.examConfig.exam.title,
      takenAt: new Date().toISOString(),
      result: results,
      answers: state.answers,
      config: state.examConfig,
      imageMap: state.imageMap,
      questionOrder: state.questionOrder,
      sessionMode: state.sessionMode,
      timeLimitSeconds: state.timeLimitSeconds,
    });
    await storage.clearExamSession();

    set({ status: 'submitted', results });
  },
  resetExam: async () => {
    await getServiceContainer().storage.clearExamSession();
    set({
      sourceExamConfig: null,
      examConfig: null,
      imageMap: {},
      status: 'idle',
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: [],
      visitedQuestions: [],
      questionOrder: [],
      timeRemainingSeconds: 0,
      perQuestionRemainingSeconds: {},
      examStartedAt: null,
      results: null,
      validationWarnings: [],
      sessionMode: 'timed',
      timeLimitSeconds: null,
      config: createEmptyConfig(),
    });
  },
  hydrateSession: (session) => set({
    sourceExamConfig: session.examConfig,
    examConfig: session.examConfig,
    imageMap: session.imageMap,
    status: session.status,
    currentQuestionIndex: session.currentQuestionIndex,
    answers: session.answers,
    flaggedQuestions: session.flaggedQuestions,
    visitedQuestions: session.visitedQuestions,
    questionOrder: session.questionOrder,
    timeRemainingSeconds: session.timeRemainingSeconds,
    perQuestionRemainingSeconds: session.perQuestionRemainingSeconds,
    examStartedAt: session.examStartedAt,
    results: null,
    validationWarnings: [],
    sessionMode: session.sessionMode ?? 'timed',
    timeLimitSeconds: session.timeLimitSeconds ?? null,
    config: createDefaultConfig(session.examConfig),
  }),
  loadHistoryEntry: (entry) => set({
    sourceExamConfig: entry.config,
    examConfig: entry.config,
    imageMap: entry.imageMap,
    status: 'submitted',
    currentQuestionIndex: 0,
    answers: entry.answers,
    flaggedQuestions: [],
    visitedQuestions: entry.questionOrder.length > 0
      ? entry.questionOrder
      : entry.config.sections.flatMap((section) => section.questions).map((question) => question.id),
    questionOrder: entry.questionOrder.length > 0
      ? entry.questionOrder
      : entry.config.sections.flatMap((section) => section.questions).map((question) => question.id),
    timeRemainingSeconds: 0,
    perQuestionRemainingSeconds: {},
    examStartedAt: null,
    results: entry.result,
    validationWarnings: [],
    sessionMode: entry.sessionMode ?? 'timed',
    timeLimitSeconds: entry.timeLimitSeconds ?? null,
    config: createDefaultConfig(entry.config),
  }),
  exportAllHistory: async (format) => {
    const entries = await getServiceContainer().storage.loadFullHistory();
    const file = await generateBackupFile(entries, format);
    downloadBackupFile(file.filename, file.blob);
  },
}));


