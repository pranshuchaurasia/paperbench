import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('@tanstack/react-router', () => ({
  createRoute: (config: unknown) => config,
  createRootRoute: (config: unknown) => config,
  useNavigate: () => mocks.navigate,
  redirect: (config: unknown) => config,
  Outlet: () => null,
  useRouterState: () => '/',
  Link: ({ children, ...props }: { children: any }) => <a {...props}>{children}</a>,
}));

vi.mock('sonner', () => ({
  toast: mocks.toast,
  Toaster: () => null,
}));

import { LiveExamPage } from '../src/routes/exam/live';
import { ReviewPage } from '../src/routes/exam/review';
import { ServiceProvider } from '../src/services/ServiceProvider';
import { frontendAssessmentYaml } from '../src/samples/frontendAssessment';
import { useExamStore } from '../src/store/examStore';
import type { Question, UserAnswer } from '../src/types';
import { buildQuestionMap } from '../src/utils/exam';

const finetuningYaml = readFileSync('finetuning.yaml', 'utf8');
const testStorage = {
  saveExamSession: vi.fn(async () => undefined),
  loadExamSession: vi.fn(async () => null),
  clearExamSession: vi.fn(async () => undefined),
  saveToHistory: vi.fn(async () => undefined),
  loadHistory: vi.fn(async () => []),
  loadFullHistory: vi.fn(async () => []),
  deleteHistoryEntry: vi.fn(async () => undefined),
  saveThemePreference: vi.fn(async () => undefined),
  loadThemePreference: vi.fn(async () => null),
};
const testTimer = {
  start: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  stop: vi.fn(),
  getRemaining: vi.fn(() => 0),
};

function resetStore() {
  useExamStore.setState(useExamStore.getInitialState());
}

function renderWithServices(ui: any) {
  return render(
    <ServiceProvider overrides={{ storage: testStorage, timer: testTimer }}>
      {ui}
    </ServiceProvider>,
  );
}

function initializeExam(yaml: string, options?: { customCount?: number }) {
  renderWithServices(<div />);
  act(() => {
    useExamStore.getState().loadExam(yaml, {});
    if (options?.customCount) {
      useExamStore.getState().setQuestionCountMode('custom');
      useExamStore.getState().setCustomQuestionCount(options.customCount);
    }
  });

  const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
  act(() => {
    useExamStore.getState().applyConfigAndStart();
  });
  randomSpy.mockRestore();
}

function getQuestion(questionId: string): Question {
  const examConfig = useExamStore.getState().examConfig;
  if (!examConfig) {
    throw new Error('No active exam config.');
  }

  const entry = buildQuestionMap(examConfig)[questionId];
  if (!entry) {
    throw new Error(`Question ${questionId} not found.`);
  }
  return entry.question;
}

function buildAnswer(question: Question, mode: 'correct' | 'wrong' | 'text' = 'correct'): UserAnswer {
  switch (question.type) {
    case 'single_choice':
      return {
        type: 'single_choice',
        selectedOptionId: mode === 'wrong'
          ? question.options.find((option) => option.id !== question.correct_answer)?.id ?? question.correct_answer
          : question.correct_answer,
      };
    case 'multiple_choice':
      return {
        type: 'multiple_choice',
        selectedOptionIds: mode === 'wrong'
          ? [question.correct_answers[0], question.options.find((option) => !question.correct_answers.includes(option.id))?.id].filter(Boolean) as string[]
          : [...question.correct_answers],
      };
    case 'true_false':
      return {
        type: 'true_false',
        selectedValue: mode === 'wrong'
          ? (question.correct_answer === 'true' ? 'false' : 'true')
          : question.correct_answer,
      };
    case 'type_answer':
      return {
        type: 'type_answer',
        text: mode === 'text'
          ? 'I would inspect layout shifts with DevTools, check CLS sources, and stabilize the responsive layout.'
          : 'Practice answer text.',
      };
    default:
      throw new Error('Unsupported question type.');
  }
}

function answerQuestion(questionId: string, mode: 'correct' | 'wrong' | 'text' = 'correct') {
  act(() => {
    useExamStore.getState().answerQuestion(questionId, buildAnswer(getQuestion(questionId), mode));
  });
}

describe('review and submission flows', () => {
  beforeEach(() => {
    resetStore();
    mocks.navigate.mockReset();
    Object.values(mocks.toast).forEach((mock) => mock.mockReset());
    Object.values(testStorage).forEach((mock) => mock.mockClear());
    Object.values(testTimer).forEach((mock) => mock.mockClear());
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows a confirmation modal with unanswered counts before submitting a 10-question session', async () => {
    initializeExam(finetuningYaml, { customCount: 10 });
    renderWithServices(<LiveExamPage />);

    useExamStore.getState().questionOrder.slice(0, 3).forEach((questionId) => answerQuestion(questionId, 'correct'));

    fireEvent.click(screen.getByRole('button', { name: /^Submit Exam$/i }));

    expect(screen.getByText(/Submit exam\?/i)).toBeInTheDocument();
    expect(screen.getByText(/7 questions not answered/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Go Back/i }));
    expect(screen.queryByText(/Submit exam\?/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Submit Exam$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Submit Anyway/i }));

    await waitFor(() => expect(useExamStore.getState().status).toBe('submitted'));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/exam/results' });
  });

  it('renders skipped questions correctly and the review toggle reorders the question flow', async () => {
    initializeExam(finetuningYaml, { customCount: 10 });

    act(() => {
      useExamStore.setState((state) => ({
        ...state,
        questionOrder: [...state.questionOrder].reverse(),
      }));
    });

    useExamStore.getState().questionOrder.slice(0, 3).forEach((questionId) => answerQuestion(questionId, 'correct'));

    await act(async () => {
      await useExamStore.getState().submitExam();
    });

    renderWithServices(<ReviewPage />);

    expect(screen.getAllByText('SKIPPED')).toHaveLength(7);
    expect(screen.getAllByText(/Not answered - no option was selected/i)).toHaveLength(7);

    const examOrderHeaders = screen.getAllByTestId('review-section-header').map((node) => node.textContent?.replace(/\s+/g, ' ').trim());
    const examOrderQuestions = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent?.trim());

    fireEvent.click(screen.getByRole('button', { name: /Section Order/i }));
    const sectionOrderHeaders = screen.getAllByTestId('review-section-header').map((node) => node.textContent?.replace(/\s+/g, ' ').trim());
    const sectionOrderQuestions = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent?.trim());
    expect(sectionOrderHeaders).not.toEqual(examOrderHeaders);
    expect(sectionOrderQuestions).not.toEqual(examOrderQuestions);

    fireEvent.click(screen.getByRole('button', { name: /Exam Order/i }));
    const restoredHeaders = screen.getAllByTestId('review-section-header').map((node) => node.textContent?.replace(/\s+/g, ' ').trim());
    const restoredQuestions = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent?.trim());
    expect(restoredHeaders).toEqual(examOrderHeaders);
    expect(restoredQuestions).toEqual(examOrderQuestions);
  });

  it('submits directly with no modal when every question is answered', async () => {
    initializeExam(frontendAssessmentYaml);
    renderWithServices(<LiveExamPage />);

    useExamStore.getState().questionOrder.forEach((questionId) => {
      const question = getQuestion(questionId);
      answerQuestion(questionId, question.type === 'type_answer' ? 'text' : 'correct');
    });

    fireEvent.click(screen.getByRole('button', { name: /^Submit Exam$/i }));

    await waitFor(() => expect(useExamStore.getState().status).toBe('submitted'));
    expect(screen.queryByText(/Submit exam\?/i)).not.toBeInTheDocument();
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/exam/results' });
  });

  it('mentions flagged questions in the submit confirmation modal', () => {
    initializeExam(frontendAssessmentYaml);
    renderWithServices(<LiveExamPage />);

    useExamStore.getState().questionOrder.forEach((questionId) => {
      const question = getQuestion(questionId);
      answerQuestion(questionId, question.type === 'type_answer' ? 'text' : 'correct');
    });

    act(() => {
      useExamStore.getState().toggleFlag(useExamStore.getState().questionOrder[1]!);
    });

    fireEvent.click(screen.getByRole('button', { name: /^Submit Exam$/i }));

    expect(screen.getByText(/1 question flagged for review/i)).toBeInTheDocument();
    expect(screen.queryByText(/not answered/i)).not.toBeInTheDocument();
  });

  it('highlights wrong answers, missed correct answers, and unanswered type answers on review', async () => {
    initializeExam(frontendAssessmentYaml);

    answerQuestion('fe-1', 'wrong');
    answerQuestion('fe-2', 'wrong');

    await act(async () => {
      await useExamStore.getState().submitExam();
    });

    renderWithServices(<ReviewPage />);

    expect(screen.getAllByTestId('review-option-selected-wrong').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('review-option-correct-unselected').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Correct answer/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/No answer provided/i)).toBeInTheDocument();
    expect(screen.getByText(/Reference answer/i)).toBeInTheDocument();
    expect(screen.getAllByText('SKIPPED').length).toBeGreaterThanOrEqual(2);
  });

  it('shows answered type-answer text side by side with the reference answer on review', async () => {
    initializeExam(frontendAssessmentYaml);

    answerQuestion('fe-1', 'correct');
    answerQuestion('fe-2', 'correct');
    answerQuestion('fe-3', 'correct');
    answerQuestion('fe-4', 'text');

    await act(async () => {
      await useExamStore.getState().submitExam();
    });

    renderWithServices(<ReviewPage />);

    expect(screen.getByText(/MANUAL REVIEW/i)).toBeInTheDocument();
    expect(screen.getByText(/I would inspect layout shifts with DevTools/i)).toBeInTheDocument();
    expect(screen.getByText(/A strong answer covers reproduction/i)).toBeInTheDocument();
  });
});

