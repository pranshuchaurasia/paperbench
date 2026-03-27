# PaperBench

PaperBench is an offline-first technical assessment runner built with React, TypeScript, Vite, TanStack Router, Zustand, and Dexie. It loads YAML-defined exams entirely in the browser, lets the candidate configure a focused session before starting, runs timed or untimed attempts locally, stores history in IndexedDB, and exports results without any backend.

## Overview

PaperBench is designed around one core idea: authors write YAML in their own editor, and PaperBench handles upload, validation, briefing, delivery, scoring, review, history, metrics, and exports.

The app currently supports:

- YAML and ZIP-based exam loading
- Required per-question topic tags
- Session setup filters for difficulty, topic, type, and question count
- Timed sessions and untimed practice mode
- Auto-scored and manual-review question types
- Read-only review with exam-order and section-order sorting
- History backups and analytics dashboards
- Client-side Markdown, YAML, JSON, and PDF exports

## Product Flow

### Candidate flow

1. Open `/` and click `Start Exam`.
2. Upload a `.yaml`, `.yml`, or `.zip` package on `/upload`.
3. Review validation feedback and continue to `/exam/setup`.
4. Configure the session:
   - difficulty filters
   - topic-tag filters
   - question-type filters
   - all questions or custom count
   - timed or practice mode
   - YAML timing or custom timing
5. Start the session on `/exam/live`.
6. Submit and view `/exam/results`.
7. Inspect `/exam/review`, export files, revisit attempts in `/history`, and inspect trends in `/metrics`.

### Author flow

1. Write an exam in YAML using the schema documented in the app docs and exported documentation.
2. Keep images beside the YAML or package them into a ZIP.
3. Upload the file bundle to PaperBench.
4. Validate, configure, and run the exam locally.

## Route Map

- `/` hero landing page
- `/upload` dedicated upload and validation page
- `/docs` in-app YAML authoring documentation
- `/history` attempt list, resume, per-attempt actions, and full-history backup
- `/metrics` aggregate analytics dashboard
- `/exam/setup` briefing plus pre-exam configuration
- `/exam/live` live runtime for timed or practice sessions
- `/exam/results` score dashboard and export entry point
- `/exam/review` answer review with exam-order and section-order sorting

## Core Features

### Upload and validation

- Accepts `.yaml`, `.yml`, or `.zip`
- Supports YAML plus dropped image files in one upload gesture
- Validates schema before entering the exam flow
- Shows upload-time errors and warnings instead of flooding setup or runtime pages
- Supports bundled sample exams for quick testing

### YAML-driven exams

Supported question types:

- `single_choice`
- `multiple_choice`
- `true_false`
- `type_answer`

Supported content features:

- `code_snippet`
- `image`
- `partial_credit`
- `negative_marking`
- `shuffle_questions`
- `shuffle_options`
- `allow_review`
- `show_correct_after_submit`
- `pass_percentage`
- `theme`

### Session configuration

Before the exam starts, PaperBench derives a configurable session from the uploaded YAML.

Available controls:

- difficulty filter
- topic filter from required `tags`
- question type filter
- all matching or custom question count
- timed mode using YAML defaults
- timed mode with custom global or per-question timing
- practice mode with no countdown and free review navigation

Zero-match combinations are blocked. The setup screen shows a diagnostic and disables the start button until at least one question matches.

### Live runtime

- question palette with visited, answered, and flagged states
- global timer or per-question timer
- practice mode badge instead of countdown
- autosave for active sessions
- submit confirmation when unanswered or flagged questions remain
- forward-only behavior when `allow_review: false`

### Results and review

- score summary with pass/fail state when configured
- per-question scoring details
- manual-review handling for `type_answer`
- review state labels for correct, incorrect, skipped, and manual review
- correct-answer highlighting for missed options
- sort review by exam order or original section order

### History and metrics

History page:

- resume active sessions
- search attempts by title
- sort by date, score, or title
- filter passed, failed, or no-threshold attempts
- view saved results
- export a single attempt
- delete attempts
- back up all attempts as JSON or YAML

Metrics page:

- total attempts
- average score
- pass rate
- total time spent
- performance-over-time chart
- average score by exam chart
- difficulty breakdown chart when data is present
- recent activity feed

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

### Create a production build

```bash
npm run build
```

### Run the test suite

```bash
npm test
```

## YAML Authoring Guide

Every exam needs these top-level blocks:

- `exam`
- `settings`
- `sections`

### Minimal valid example

```yaml
exam:
  title: "Quick Quiz"
  description: "A one-question demo"

settings:
  timer_mode: "global"
  total_time_minutes: 5

sections:
  - name: "General"
    questions:
      - id: "q1"
        type: "true_false"
        difficulty: "easy"
        points: 1
        question: "HTML stands for HyperText Markup Language."
        correct_answer: "true"
        tags: ["html-basics"]
```

### Required question fields

- `id`
- `type`
- `difficulty`
- `points`
- `question`
- `tags`

### Tag rules

- `tags` is required on every question.
- Each question must have at least one topic tag.
- Tags must be lowercase kebab-case.
- Difficulty values belong in `difficulty`, not in `tags`.
- Topic tags are used by the setup-page filter system.

### Points rules

- scored question types require `points >= 1`
- `type_answer` must use `points: 0`

### Timer rules

- `timer_mode: "global"` uses `total_time_minutes`
- `timer_mode: "per_question"` uses `time_limit_seconds` on each question
- setup can override timing or switch to untimed practice mode

### Review rules

- `allow_review: false` creates forward-only timed navigation
- practice mode forces free navigation regardless of YAML review lock
- `show_correct_after_submit` controls whether review reveals correct answers and explanations

## Example schema snippets

### Single choice

```yaml
- id: "q1"
  type: "single_choice"
  difficulty: "easy"
  points: 2
  question: "Which HTML element is best for the main content?"
  options:
    - id: "a"
      text: "<div>"
    - id: "b"
      text: "<main>"
    - id: "c"
      text: "<section>"
  correct_answer: "b"
  tags: ["html", "semantics"]
```

### Multiple choice

```yaml
- id: "q2"
  type: "multiple_choice"
  difficulty: "medium"
  points: 4
  question: "Which are valid CSS display values?"
  options:
    - id: "a"
      text: "block"
    - id: "b"
      text: "inline-flex"
    - id: "c"
      text: "visible"
    - id: "d"
      text: "grid"
  correct_answers: ["a", "b", "d"]
  partial_credit: true
  tags: ["css", "layout"]
```

### True / false

```yaml
- id: "q3"
  type: "true_false"
  difficulty: "easy"
  points: 1
  question: "A button inside a form defaults to submit."
  correct_answer: "true"
  tags: ["html", "forms"]
```

### Type answer

```yaml
- id: "q4"
  type: "type_answer"
  difficulty: "hard"
  points: 0
  question: "Explain how you would debug a layout shift."
  min_characters: 80
  max_characters: 1200
  reference_answer: "A strong answer covers reproduction, tooling, CLS sources, and targeted fixes."
  tags: ["debugging", "performance"]
```

### Code snippets and images

```yaml
- id: "q5"
  type: "single_choice"
  difficulty: "hard"
  points: 4
  question: "What will this code output?"
  code_snippet:
    language: "javascript"
    code: |
      const arr = [1, 2, 3];
      arr[10] = 11;
      console.log(arr.length);
  image:
    src: "images/layout.png"
    alt: "Example layout"
    caption: "Reference image"
  options:
    - id: "a"
      text: "3"
    - id: "b"
      text: "11"
  correct_answer: "b"
  tags: ["javascript", "arrays"]
```

## Persistence Model

PaperBench uses IndexedDB through Dexie for:

- the active exam session
- full attempt history
- reviewable saved answers and question order
- theme preference
- cached remote images

Data is stored locally in the browser. There is no server-side persistence in the current implementation.

## Export System

### Per-attempt exports

Available from results and history:

- Markdown report
- YAML answer sheet
- PDF dashboard capture

### Full-history backup

Available from `/history`:

- JSON archive of all attempts
- YAML archive of all attempts

Backups include score data, answer data, section scores, timing metadata, and identifiers for matching attempts. They do not include the original YAML exam files or bundled images.

### Exported docs README

The docs page can download a standalone Markdown reference file:

- filename: `PaperBench-Documentation.md`
- source: client-side generated template
- purpose: offline authoring reference for YAML creators

## Project Structure

```text
src/
  components/
    docs/
    exam/
    history/
    layout/
    metrics/
    results/
    review/
    setup/
    ui/
  hooks/
  routes/
    exam/
  samples/
  services/
    impl/
  store/
  styles/
  types/
  utils/
examples/
  frontend-assessment/
  minimal-exam/
  ml-fine-tuning/
tests/
  criticalBugfixFlows.test.tsx
  reviewSubmissionFlows.test.tsx
  services.test.ts
```

## Sample Content

Bundled sample exams include:

- Frontend Developer Assessment
- ML Fine-Tuning Assessment
- API Design and Backend Assessment
- Minimal Quiz

There is also a larger local authoring sample in [finetuning.yaml](f:/Projects/exam_practice/finetuning.yaml) used heavily in setup-page testing.

## Testing and Verification

Current automated coverage includes:

- parser and scoring behavior
- setup-page critical filter flows
- review and submission flows
- history and export-related service behavior

Latest verified commands:

```bash
npm test
npm run build
```

At the time of the latest verification pass:

- `23/23` tests passed
- production build passed

## Known Notes

- The production bundle is still large because Monaco and chart-heavy code are eagerly loaded.
- PDF export is screenshot-based, so output depends on the rendered DOM.
- Restore-from-backup is not implemented yet.
- The app is offline-first, but direct HTTPS image behavior still depends on browser fetch availability before local cache resolution.

## License

MIT
