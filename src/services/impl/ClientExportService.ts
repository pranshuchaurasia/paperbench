// ================================================================
// FILE: src/services/impl/ClientExportService.ts
// PURPOSE: Client-side export generators for markdown, YAML, PDF, and docs output.
// DEPENDENCIES: html2canvas, jspdf, js-yaml, jszip, src/types, src/utils
// ================================================================

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import yaml from 'js-yaml';
import JSZip from 'jszip';
import type { ExamConfig, ExamResult, UserAnswer } from '../../types';
import { buildQuestionMap } from '../../utils/exam';
import { formatTime } from '../../utils/formatTime';
import { sha256 } from '../../utils/hash';
import type { FileExportResult, IExportService } from '../interfaces';

function isRelativeImageSource(source: string) {
  return !source.startsWith('data:') && !/^https?:\/\//i.test(source);
}

const DOCS_README_TEMPLATE = `
# PaperBench - Documentation

> Write YAML in your own editor. Run it in PaperBench.

PaperBench is an exam runner, not a YAML IDE. Author exams in VS Code or your
preferred editor, then upload them into the app for validation, configuration,
runtime delivery, scoring, review, and export.

---

## Table of Contents

- [Quick Start](#quick-start)
- [File Formats](#file-formats)
- [Configuring Your Session](#configuring-your-session)
- [YAML Schema](#yaml-schema)
  - [Exam Metadata](#exam-metadata)
  - [Settings](#settings)
  - [Sections and Questions](#sections-and-questions)
- [Question Types](#question-types)
  - [Single Choice](#single-choice)
  - [Multiple Choice](#multiple-choice)
  - [True / False](#true--false)
  - [Type Answer](#type-answer)
- [Advanced Features](#advanced-features)
  - [Code Snippets](#code-snippets)
  - [Image Support](#image-support)
  - [Partial Credit](#partial-credit)
  - [Negative Marking](#negative-marking)
  - [Timer Modes](#timer-modes)
  - [Review Behavior](#review-behavior)
- [Export Formats](#export-formats)
  - [Markdown Report](#markdown-report)
  - [YAML Answer Sheet](#yaml-answer-sheet)
  - [PDF Dashboard](#pdf-dashboard)
- [Examples](#examples)
- [Field Reference](#field-reference)
- [Operational Notes](#operational-notes)

---

## Quick Start

1. Create a YAML file with top-level __BT__exam__BT__, __BT__settings__BT__, and __BT__sections__BT__ blocks.
2. Open PaperBench and click **Start Exam**.
3. Drop your YAML file, YAML plus images, or ZIP bundle on __BT__/upload__BT__.
4. Review validation feedback and continue to the setup screen.
5. Configure filters, question count, and timer behavior if needed.
6. Start the exam, answer questions, submit, and review the results.

---

## File Formats

PaperBench accepts:

| Format | When to use it | Notes |
|--------|---------------|-------|
| Single YAML file | Text-only exams or remote-image exams | Fastest authoring loop |
| YAML + dropped image files | Local images beside the YAML | Drop all files together on __BT__/upload__BT__ |
| ZIP bundle | Portable package with __BT__exam.yaml__BT__ and assets | Best for sharing image-heavy exams |

Relative image references are resolved from uploaded companion files or ZIP assets.
HTTPS images may also be used and are cached locally when fetched by the app.

---

## Configuring Your Session

After upload, PaperBench opens a setup screen that lets the candidate shape the
session before starting.

### Filters

- **Difficulty:** include any available combination of __BT__easy__BT__, __BT__medium__BT__, and __BT__hard__BT__.
- **Topics:** filter by required per-question topic tags from the __BT__tags__BT__ array.
- **Question Types:** include single choice, multiple choice, true / false, and/or type answer.
- **Question Count:** use all matching questions or request a smaller random subset.

### Timer Options

- **Timed:** use YAML defaults or override timing.
- **Global countdown:** one timer for the whole exam.
- **Per-question timing:** each question gets its own countdown.
- **Practice (untimed):** untimed session with free navigation and tracked elapsed time.

### Zero-match diagnostics

If the selected filter combination produces zero matching questions, PaperBench:

- disables the start button
- shows a diagnostic explaining which filter combination failed
- suggests which filters to relax
- offers a reset path back to defaults

---

## YAML Schema

## Exam Metadata

The __BT__exam__BT__ block defines what appears on setup, results, history, review,
and exports.

__BT____BT____BT__yaml
exam:
  title: "Frontend Developer Assessment"
  description: "Evaluate core frontend skills."
  version: "1.0"
  author: "Jane Smith"
  created_at: "2026-03-15"
__BT____BT____BT__

| Field | Required | Type | Notes |
|------|----------|------|------|
| __BT__title__BT__ | Yes | string | Displayed across the app |
| __BT__description__BT__ | Yes | string | Shown on setup and exports |
| __BT__version__BT__ | No | string | Useful for exam tracking |
| __BT__author__BT__ | No | string | Optional display metadata |
| __BT__created_at__BT__ | No | string | ISO-like date string |

## Settings

The __BT__settings__BT__ block controls timing, shuffling, review permissions,
scoring rules, and theme.

__BT____BT____BT__yaml
settings:
  timer_mode: "global"
  total_time_minutes: 45
  shuffle_questions: true
  shuffle_options: true
  allow_review: true
  show_correct_after_submit: true
  pass_percentage: 70
  negative_marking:
    enabled: false
    mode: "fixed"
    value: 0.25
  theme: "system"
__BT____BT____BT__

| Field | Required | Notes |
|------|----------|------|
| __BT__timer_mode__BT__ | Yes | __BT__global__BT__ or __BT__per_question__BT__ |
| __BT__total_time_minutes__BT__ | Global only | Required when using a global timer |
| __BT__shuffle_questions__BT__ | No | Randomizes final session order |
| __BT__shuffle_options__BT__ | No | Randomizes supported option lists |
| __BT__allow_review__BT__ | No | __BT__false__BT__ creates forward-only timed navigation |
| __BT__show_correct_after_submit__BT__ | No | Controls answer visibility on review |
| __BT__pass_percentage__BT__ | No | Pass threshold for scored questions |
| __BT__negative_marking__BT__ | No | Optional scoring penalty |
| __BT__theme__BT__ | No | __BT__dark__BT__, __BT__light__BT__, or __BT__system__BT__ |

## Sections and Questions

Sections group related questions. Each question must include:

- __BT__id__BT__
- __BT__type__BT__
- __BT__difficulty__BT__
- __BT__points__BT__
- __BT__question__BT__
- __BT__tags__BT__

__BT____BT____BT__yaml
sections:
  - name: "HTML and CSS Fundamentals"
    description: "Core web platform knowledge"
    questions:
      - id: "q1"
        type: "single_choice"
        difficulty: "easy"
        points: 2
        question: "Which HTML element is best for the main content?"
        tags: ["html", "semantics"]
__BT____BT____BT__

Tag rules:

- __BT__tags__BT__ is required
- each question must have at least one topic tag
- tags must be lowercase kebab-case
- difficulty values are not tags

---

## Question Types

### Single Choice

The candidate selects exactly one option.

__BT____BT____BT__yaml
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
  explanation: "The <main> element represents the dominant content."
  tags: ["html", "semantics"]
__BT____BT____BT__

Rules:

- __BT__correct_answer__BT__ must match an option id
- option count should be between 2 and 6
- full points are awarded for a correct answer

### Multiple Choice

The candidate selects all correct options.

__BT____BT____BT__yaml
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
__BT____BT____BT__

Rules:

- __BT__correct_answers__BT__ must reference valid option ids
- partial credit is supported when __BT__partial_credit: true__BT__ is set
- without partial credit, the exact set must match

### True / False

Binary auto-scored prompt.

__BT____BT____BT__yaml
- id: "q3"
  type: "true_false"
  difficulty: "easy"
  points: 1
  question: "A button inside a form defaults to submit."
  correct_answer: "true"
  tags: ["html", "forms"]
__BT____BT____BT__

Rules:

- __BT__correct_answer__BT__ must be the string __BT__"true"__BT__ or __BT__"false"__BT__

### Type Answer

Free-text response for manual review.

__BT____BT____BT__yaml
- id: "q4"
  type: "type_answer"
  difficulty: "hard"
  points: 0
  question: "Explain how you would debug a layout shift."
  min_characters: 80
  max_characters: 1200
  placeholder: "Describe your approach..."
  reference_answer: "A strong answer covers reproduction, tooling, CLS sources, and targeted fixes."
  tags: ["debugging", "performance"]
__BT____BT____BT__

Rules:

- __BT__points__BT__ must be __BT__0__BT__
- type-answer questions are not auto-scored
- review/export surfaces preserve the written response and reference answer

---

## Advanced Features

### Code Snippets

Any question type can include a __BT__code_snippet__BT__ object.

__BT____BT____BT__yaml
code_snippet:
  language: "javascript"
  code: |
    const arr = [1, 2, 3];
    arr[10] = 11;
    console.log(arr.length);
__BT____BT____BT__

### Image Support

Any question can include:

__BT____BT____BT__yaml
image:
  src: "images/grid-layout.png"
  alt: "Header spanning full width, two equal columns, footer"
  width: 500
  caption: "Figure: Target layout to recreate"
  position: "below_question"
__BT____BT____BT__

Image source options:

1. drop the YAML with local image files
2. upload a ZIP bundle containing YAML plus images
3. use a __BT__data:__BT__ URI
4. use an HTTPS URL

### Partial Credit

For __BT__multiple_choice__BT__ questions, partial credit rewards partial correctness while
penalizing extra wrong selections. The score is clamped so it never goes below zero.

### Negative Marking

Negative marking deducts points for wrong answers. It does not apply to:

- unanswered questions
- type-answer questions
- manual-review questions

### Timer Modes

- __BT__global__BT__: one countdown for the entire session
- __BT__per_question__BT__: each question gets its own countdown
- setup-screen practice mode: no countdown, manual submit only

### Review Behavior

After submission, PaperBench preserves these states distinctly:

- correct
- incorrect
- unanswered / skipped
- manual review

Unanswered questions remain unanswered in the stored result. They are not silently
converted into fake selections.

---

## Export Formats

### Markdown Report

Human-readable summary for one attempt.

__BT____BT____BT__markdown
# PaperBench - Results Report

## Score Summary
- **Total Score:** 52 / 75 (69.3%)
- **Result:** FAILED (threshold: 70%)

### Q1: Which HTML element is best for main content?
- **Points:** 2/2
- **Your Answer:** (b) <main>
__BT____BT____BT__

### YAML Answer Sheet

Machine-readable export for one attempt.

__BT____BT____BT__yaml
exam_title: "Frontend Developer Assessment"
date_taken: "2026-03-26T14:30:00Z"
score:
  total: 52
  possible: 75
  percentage: 69.3
  passed: false
answers:
  - question_id: "q1"
    type: "single_choice"
    selected: "b"
    correct: "b"
    is_correct: true
    points_earned: 2
    points_possible: 2
__BT____BT____BT__

### PDF Dashboard

Visual export created from the rendered results or review surface. Good for
printing and archival.

---

## Examples

Bundled examples in this repository:

- __BT__examples/minimal-exam/exam.yaml__BT__
- __BT__examples/frontend-assessment/exam.yaml__BT__
- __BT__examples/ml-fine-tuning/exam.yaml__BT__

There is also a larger local authoring sample used in setup-flow testing:

- __BT__finetuning.yaml__BT__

---

## Field Reference

### Question Fields

| Field | Type | Required | Notes |
|------|------|----------|------|
| __BT__id__BT__ | string | Yes | Globally unique across all sections |
| __BT__type__BT__ | string | Yes | __BT__single_choice__BT__, __BT__multiple_choice__BT__, __BT__true_false__BT__, __BT__type_answer__BT__ |
| __BT__difficulty__BT__ | string | Yes | __BT__easy__BT__, __BT__medium__BT__, __BT__hard__BT__ |
| __BT__points__BT__ | integer | Yes | __BT__0__BT__ for type answer, __BT__>= 1__BT__ for scored questions |
| __BT__question__BT__ | string | Yes | Prompt shown in the runtime |
| __BT__tags__BT__ | string[] | Yes | Lowercase kebab-case topic tags |
| __BT__options__BT__ | array | Choice types | List of option objects |
| __BT__correct_answer__BT__ | string | Single choice / true_false | Correct option id or string boolean |
| __BT__correct_answers__BT__ | string[] | Multiple choice | Correct option ids |
| __BT__partial_credit__BT__ | boolean | No | Multiple choice only |
| __BT__code_snippet__BT__ | object | No | __BT__{ language, code }__BT__ |
| __BT__image__BT__ | object | No | __BT__{ src, alt, width?, caption?, position? }__BT__ |
| __BT__reference_answer__BT__ | string | Type answer | Used for manual review |

### Settings Fields

| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| __BT__timer_mode__BT__ | string | Yes | - | __BT__global__BT__ or __BT__per_question__BT__ |
| __BT__total_time_minutes__BT__ | integer | If global | - | Total exam duration |
| __BT__shuffle_questions__BT__ | boolean | No | false | Randomize final session question order |
| __BT__shuffle_options__BT__ | boolean | No | false | Randomize supported options |
| __BT__allow_review__BT__ | boolean | No | true | __BT__false__BT__ locks earlier questions in timed sessions |
| __BT__show_correct_after_submit__BT__ | boolean | No | true | Controls review answer visibility |
| __BT__pass_percentage__BT__ | integer | No | null | Pass threshold |
| __BT__negative_marking.enabled__BT__ | boolean | No | false | Enables penalties |
| __BT__negative_marking.mode__BT__ | string | No | - | __BT__fixed__BT__ or __BT__percentage__BT__ |
| __BT__negative_marking.value__BT__ | number | No | - | Penalty amount |
| __BT__theme__BT__ | string | No | system | __BT__dark__BT__, __BT__light__BT__, or __BT__system__BT__ |

---

## Operational Notes

- PaperBench is fully client-side in the current implementation.
- Active sessions, history, metrics inputs, and image cache live in IndexedDB.
- History backup is download-only in v1. Restore is not implemented.
- The downloadable docs filename is __BT__PaperBench-Documentation.md__BT__.
- For the latest in-app reference, open __BT__/docs__BT__ inside PaperBench.

---

*Generated by PaperBench.*
`.trim().replaceAll('__BT__', '`');

/**
 * ClientExportService creates browser-side export artifacts.
 */
export class ClientExportService implements IExportService {
  exportDocsAsReadme(): string {
    return DOCS_README_TEMPLATE;
  }

  async exportAsMarkdown(
    config: ExamConfig,
    result: ExamResult,
    answers: Record<string, UserAnswer>,
    imageMap: Record<string, string>,
  ): Promise<FileExportResult> {
    const questionMap = buildQuestionMap(config);
    const showCorrectness = config.settings.show_correct_after_submit ?? true;
    const lines = [
      '# PaperBench - Results Report',
      '## Exam Information',
      `- **Title:** ${config.exam.title}`,
      `- **Duration:** ${formatTime(result.timeTakenSeconds)}`,
      '## Score Summary',
      `- **Total Score:** ${result.totalScore}/${result.totalPossibleScore} (${result.percentage}%)`,
      `- **Result:** ${result.passed == null ? 'N/A' : result.passed ? 'PASSED' : 'FAILED'}`,
      '## Detailed Results',
    ];

    const relativeImages = new Map<string, string>();

    for (const questionResult of result.questionResults) {
      const question = questionMap[questionResult.questionId]?.question;
      lines.push(`### ${questionResult.questionId}: ${questionResult.questionText}`);
      lines.push(`- **Type:** ${questionResult.type}`);
      lines.push(`- **Points:** ${questionResult.pointsEarned ?? 'Manual'}/${questionResult.pointsPossible ?? 'Manual'}`);
      lines.push(`- **Your Answer:** ${this.describeAnswer(answers[questionResult.questionId])}`);
      if (showCorrectness) {
        lines.push(`- **Correctness:** ${questionResult.isCorrect == null ? 'Manual review required' : questionResult.isCorrect ? 'Correct' : 'Incorrect'}`);
      }
      if (question?.image?.src) {
        lines.push(`- **Image:** ${question.image.src}`);
        if (isRelativeImageSource(question.image.src) && imageMap[question.image.src]) {
          relativeImages.set(question.image.src, imageMap[question.image.src]);
        }
      }
      lines.push('---');
    }

    lines.push('*Generated by PaperBench v1.0*');
    const markdown = lines.join('\n');

    if (relativeImages.size === 0) {
      return {
        blob: new Blob([markdown], { type: 'text/markdown' }),
        extension: 'md',
        mimeType: 'text/markdown',
      };
    }

    const archive = new JSZip();
    archive.file('report.md', markdown);
    for (const [relativePath, objectUrl] of relativeImages.entries()) {
      const response = await fetch(objectUrl);
      archive.file(relativePath, await response.blob());
    }

    return {
      blob: await archive.generateAsync({ type: 'blob' }),
      extension: 'zip',
      mimeType: 'application/zip',
    };
  }

  async exportAsYaml(
    config: ExamConfig,
    result: ExamResult,
    answers: Record<string, UserAnswer>,
  ): Promise<FileExportResult> {
    const questionMap = buildQuestionMap(config);
    const showCorrectness = config.settings.show_correct_after_submit ?? true;
    const payload = {
      exam_title: config.exam.title,
      date_taken: new Date().toISOString(),
      time_taken_seconds: result.timeTakenSeconds,
      score: {
        total: result.totalScore,
        possible: result.totalPossibleScore,
        percentage: result.percentage,
        passed: result.passed,
      },
      answers: result.questionResults.map((questionResult) => {
        const question = questionMap[questionResult.questionId]?.question;
        const answer = answers[questionResult.questionId];
        return {
          question_id: questionResult.questionId,
          type: questionResult.type,
          points_earned: questionResult.pointsEarned,
          points_possible: questionResult.pointsPossible,
          selected: answer?.type === 'single_choice' ? answer.selectedOptionId : answer?.type === 'multiple_choice' ? answer.selectedOptionIds : answer?.type === 'true_false' ? answer.selectedValue : undefined,
          response: answer?.type === 'type_answer' ? answer.text : undefined,
          correct: showCorrectness
            ? question?.type === 'single_choice' || question?.type === 'true_false'
              ? question.correct_answer
              : question?.type === 'multiple_choice'
                ? question.correct_answers
                : undefined
            : undefined,
          is_correct: showCorrectness ? questionResult.isCorrect : undefined,
          reference_answer: showCorrectness && question?.type === 'type_answer' ? question.reference_answer : undefined,
        };
      }),
      metadata: {
        paperbench_version: '1.0.0',
        yaml_hash: `sha256:${await sha256(JSON.stringify(config))}`,
      },
    };

    return {
      blob: new Blob([yaml.dump(payload, { noRefs: true })], { type: 'application/x-yaml' }),
      extension: 'yaml',
      mimeType: 'application/x-yaml',
    };
  }

  async exportAsPdf(targetElementId: string, filename: string): Promise<void> {
    const element = document.getElementById(targetElementId);
    if (!element) {
      throw new Error(`Could not find element #${targetElementId} for PDF export.`);
    }

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0a0a0f' });
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imageData, 'PNG', 0, 0, width, height);
    pdf.save(filename);
  }

  private describeAnswer(answer: UserAnswer | undefined): string {
    if (!answer) {
      return 'Unanswered';
    }
    switch (answer.type) {
      case 'single_choice':
        return answer.selectedOptionId;
      case 'multiple_choice':
        return answer.selectedOptionIds.join(', ');
      case 'true_false':
        return answer.selectedValue;
      case 'type_answer':
        return answer.text;
      default:
        return 'Unknown';
    }
  }
}


