import { readFileSync } from 'node:fs';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  readUploadBundle: vi.fn(),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
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

vi.mock('../src/utils/zipHandler', () => ({
  readUploadBundle: mocks.readUploadBundle,
}));

import { ExamHeader } from '../src/components/exam/ExamHeader';
import { SetupPage } from '../src/routes/exam/setup';
import { UploadPage } from '../src/routes/upload';
import { ServiceProvider } from '../src/services/ServiceProvider';
import { selectAllUniqueTopics, useExamStore } from '../src/store/examStore';

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

function resetStore() {
  useExamStore.setState(useExamStore.getInitialState());
}

function renderWithServices(ui: any) {
  return render(<ServiceProvider overrides={{ storage: testStorage }}>{ui}</ServiceProvider>);
}

function loadFinetuningYaml() {
  act(() => {
    useExamStore.getState().loadExam(finetuningYaml, {});
  });
}

function getUploadInput(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Upload input not found.');
  }
  return input;
}

describe('critical bugfix flows', () => {
  beforeEach(() => {
    resetStore();
    mocks.navigate.mockReset();
    mocks.readUploadBundle.mockReset();
    mocks.toast.success.mockReset();
    mocks.toast.error.mockReset();
    mocks.toast.info.mockReset();
    Object.values(testStorage).forEach((mock) => mock.mockClear());
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('TEST 1: upload and continue uses a clean success card with no warning wall', async () => {
    mocks.readUploadBundle.mockResolvedValue({ yamlText: finetuningYaml, imageMap: {} });
    const { container } = renderWithServices(<UploadPage />);
    const input = getUploadInput(container);
    const file = new File([finetuningYaml], 'finetuning.yaml', { type: 'application/x-yaml' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText('Ready to go')).toBeInTheDocument();
    expect(mocks.readUploadBundle).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('LLM Fine-Tuning Assessment')).toHaveLength(2);
    expect(screen.queryByTestId('upload-warnings-details')).not.toBeInTheDocument();
    expect(screen.queryByText(/used by only one question/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Continue to Exam/i }));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/exam/setup' });
  }, 10000);

  it('TEST 2: topic deselection updates counts, summary, and section pool in real time', () => {
    renderWithServices(<div />);
    loadFinetuningYaml();
    renderWithServices(<SetupPage />);

    expect(screen.getByRole('radio', { name: /All matching \(34\)/i })).toBeInTheDocument();
    expect(screen.getByText(/11 easy \u00B7 16 medium \u00B7 7 hard/i)).toBeInTheDocument();
    expect(screen.getByText(/19 single choice \u00B7 4 multiple choice \u00B7 11 true \/ false/i)).toBeInTheDocument();
    expect(screen.getByText(/Application Development Flows/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /fine-tuning \(28\)/i }));

    expect(screen.getByRole('radio', { name: /All matching \(6\)/i })).toBeInTheDocument();
    expect(screen.getByText(/3 easy \u00B7 3 medium \u00B7 0 hard/i)).toBeInTheDocument();
    expect(screen.getByText(/5 single choice \u00B7 1 true \/ false/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Fine-Tuning Fundamentals$/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /fine-tuning \(28\)/i }));

    expect(screen.getByRole('radio', { name: /All matching \(34\)/i })).toBeInTheDocument();
    expect(screen.getByText(/11 easy \u00B7 16 medium \u00B7 7 hard/i)).toBeInTheDocument();
  });

  it('TEST 3: custom count summary shows pool-vs-session honestly and starts a 10-question exam', () => {
    renderWithServices(<div />);
    loadFinetuningYaml();
    renderWithServices(<SetupPage />);

    fireEvent.click(screen.getAllByRole('radio', { name: /^Custom/i })[0]!);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    fireEvent.click(screen.getByLabelText(/Practice \(untimed\)/i));

    expect(screen.getByText(/10 random questions from a pool of 34 \u00B7 69 scorable points in pool \u00B7 Practice \(untimed\)/i)).toBeInTheDocument();
    expect(screen.getByText(/^Sections in pool$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Pool difficulty mix$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Pool question types$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Start Exam$/i }));

    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/exam/live' });
    expect(useExamStore.getState().status).toBe('in_progress');
    expect(useExamStore.getState().sessionMode).toBe('practice');
    expect(useExamStore.getState().questionOrder).toHaveLength(10);
  });

  it('TEST 4: practice mode starts without a timer and shows the practice badge', () => {
    renderWithServices(<div />);
    loadFinetuningYaml();
    renderWithServices(<SetupPage />);

    fireEvent.click(screen.getByLabelText(/Practice \(untimed\)/i));
    fireEvent.click(screen.getByRole('button', { name: /^Start Exam$/i }));

    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/exam/live' });
    expect(useExamStore.getState().status).toBe('in_progress');
    expect(useExamStore.getState().sessionMode).toBe('practice');
    expect(useExamStore.getState().timeRemainingSeconds).toBe(-1);

    render(
      <ExamHeader
        currentQuestion={1}
        remainingSeconds={useExamStore.getState().timeRemainingSeconds}
        sectionName="Fine-Tuning Fundamentals"
        sessionMode={useExamStore.getState().sessionMode}
        totalQuestions={useExamStore.getState().questionOrder.length}
        totalSeconds={0}
      />,
    );

    expect(screen.getByText(/^Practice Mode$/i)).toBeInTheDocument();
  });

  it('TEST 5: zero-match configuration shows the diagnostic and disables start', () => {
    renderWithServices(<div />);
    loadFinetuningYaml();
    renderWithServices(<SetupPage />);

    act(() => {
      useExamStore.getState().setTopics(['lora']);
      useExamStore.getState().setDifficulties(['medium']);
    });

    expect(screen.getByText(/No Matching Questions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Start Exam$/i })).toBeDisabled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('TEST 6: Select All / Deselect All respects the guard rails and restores all topics', () => {
    renderWithServices(<div />);
    loadFinetuningYaml();
    renderWithServices(<SetupPage />);

    const initialTopicCount = useExamStore.getState().config.selectedTopics.length;

    fireEvent.click(screen.getByRole('button', { name: /^Deselect All$/i }));
    expect(mocks.toast.error).toHaveBeenCalledWith('At least one topic must be selected.');
    expect(useExamStore.getState().config.selectedTopics).toHaveLength(initialTopicCount);

    fireEvent.click(screen.getByRole('button', { name: /lora \(1\)/i }));
    expect(useExamStore.getState().config.selectedTopics.includes('lora')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: /^Select All$/i }));
    const allTopics = selectAllUniqueTopics(useExamStore.getState());
    expect(useExamStore.getState().config.selectedTopics).toEqual(allTopics);
  });
});

