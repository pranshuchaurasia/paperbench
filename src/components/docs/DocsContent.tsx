// ================================================================
// FILE: src/components/docs/DocsContent.tsx
// PURPOSE: Main documentation content renderer for the docs page.
// DEPENDENCIES: react, src/components/docs/*, src/samples/*
// ================================================================

import { frontendAssessmentYaml } from '../../samples/frontendAssessment';
import { sampleImageMap } from '../../samples/sampleImages';
import { sampleExamLibrary } from '../../samples/sampleLibrary';
import { Card } from '../ui/Card';
import { DocsImage } from './DocsImage';
import { DocsTable } from './DocsTable';
import { ExampleCard } from './ExampleCard';
import { YamlExample } from './YamlExample';

const minimalExamYaml = `exam:
  title: "Minimal Quiz"
  description: "A tiny starter exam"

settings:
  timer_mode: "global"
  total_time_minutes: 10
  allow_review: true
  show_correct_after_submit: true

sections:
  - name: "Basics"
    questions:
      - id: "q1"
        type: "single_choice"
        difficulty: "easy"
        points: 1
        question: "Which number is even?"
        options:
          - id: "a"
            text: "3"
          - id: "b"
            text: "4"
        correct_answer: "b"
        tags: ["numbers"]`;

const singleChoiceYaml = `- id: "q1"
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
    - id: "d"
      text: "<span>"
  correct_answer: "b"
  explanation: "The <main> element represents the dominant content."
  tags: ["html", "semantics"]`;

const multipleChoiceYaml = `- id: "q2"
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
  tags: ["css", "layout"]`;

const trueFalseYaml = `- id: "q3"
  type: "true_false"
  difficulty: "easy"
  points: 1
  question: "A button inside a form defaults to submit."
  correct_answer: "true"
  tags: ["html", "forms"]`;

const typeAnswerYaml = `- id: "q4"
  type: "type_answer"
  difficulty: "hard"
  points: 0
  question: "Explain how you would debug a layout shift."
  min_characters: 80
  max_characters: 1200
  placeholder: "Describe your investigation and fix strategy..."
  reference_answer: "A strong answer covers reproduction, tooling, CLS sources, and targeted fixes."
  tags: ["debugging", "performance"]`;

const codeSnippetYaml = `- id: "q5"
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
  options:
    - id: "a"
      text: "3"
    - id: "b"
      text: "11"
  correct_answer: "b"
  tags: ["javascript", "arrays"]`;

const imageYaml = `- id: "q9"
  type: "single_choice"
  difficulty: "medium"
  points: 3
  question: "Which CSS property creates the layout shown below?"
  image:
    src: "images/grid-layout.png"
    alt: "Header spanning full width, two equal columns, footer"
    width: 500
    caption: "Figure: Target layout to recreate"
    position: "below_question"
  options:
    - id: "a"
      text: "float"
    - id: "b"
      text: "CSS Grid"
  correct_answer: "b"
  tags: ["css-grid", "layout"]`;

const markdownExportSample = `# PaperBench - Results Report

## Score Summary
- **Total Score:** 52 / 75 (69.3%)
- **Result:** FAILED (threshold: 70%)

### Q1: Which HTML element is best for main content?
- **Points:** 2/2
- **Your Answer:** (b) <main> - CORRECT`;

const yamlExportSample = `answers:
  - question_id: "q1"
    selected: "b"
    correct: "b"
    is_correct: true
    points_earned: 2`;

const mlExample = sampleExamLibrary.find((item) => item.id === 'ml-finetuning');
const apiExample = sampleExamLibrary.find((item) => item.id === 'api-design');

export const docsSidebarGroups = [
  {
    title: 'Getting Started',
    items: [
      { id: 'quick-start', label: 'Quick Start' },
      { id: 'file-formats', label: 'File Formats' },
      { id: 'configuring-session', label: 'Configuring Your Session' },
    ],
  },
  {
    title: 'YAML Schema',
    items: [
      { id: 'exam-metadata', label: 'Exam Metadata' },
      { id: 'settings', label: 'Settings' },
      { id: 'sections-questions', label: 'Sections & Questions' },
    ],
  },
  {
    title: 'Question Types',
    items: [
      { id: 'single-choice', label: 'Single Choice' },
      { id: 'multiple-choice', label: 'Multiple Choice' },
      { id: 'true-false', label: 'True / False' },
      { id: 'type-answer', label: 'Type Answer' },
    ],
  },
  {
    title: 'Advanced Features',
    items: [
      { id: 'code-snippets', label: 'Code Snippets' },
      { id: 'image-support', label: 'Image Support' },
      { id: 'partial-credit', label: 'Partial Credit' },
      { id: 'negative-marking', label: 'Negative Marking' },
      { id: 'timer-modes', label: 'Timer Modes' },
    ],
  },
  {
    title: 'Export Formats',
    items: [
      { id: 'export-markdown', label: 'Markdown' },
      { id: 'export-yaml', label: 'YAML Answer Sheet' },
      { id: 'export-pdf', label: 'PDF' },
    ],
  },
  {
    title: 'Examples',
    items: [
      { id: 'examples', label: 'Sample Exams' },
      { id: 'download-samples', label: 'Sample YAML Files' },
    ],
  },
  {
    title: 'Field Reference',
    items: [
      { id: 'field-reference', label: 'Field Reference' },
    ],
  },
];

export function DocsContent() {
  return (
    <div className="space-y-12 text-base leading-8 text-[var(--text-secondary)]">
      <section className="scroll-mt-28" data-doc-section id="quick-start">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Quick Start</h2>
        <div className="mt-6 rounded-2xl border-l-[3px] border-[var(--accent)] bg-[var(--bg-elevated)] px-4 py-4 italic text-[var(--text-secondary)]">
          Quick rule of thumb: every exam needs top-level <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">exam</code>, <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">settings</code>, and <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">sections</code> blocks.
        </div>
        <ol className="mt-6 list-decimal space-y-2 pl-5">
          <li>Create a YAML file with your exam definition.</li>
          <li>Open PaperBench and click <strong className="text-[var(--text-primary)]">Start Exam</strong>.</li>
          <li>Drop your YAML file on the upload page.</li>
          <li>Review the session configuration and exam summary.</li>
          <li>Answer questions within the time limit or in practice mode.</li>
          <li>View your score and export results.</li>
        </ol>
      </section>

      <section className="scroll-mt-28" data-doc-section id="file-formats">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">File Formats</h2>
        <p>PaperBench accepts a single <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">.yaml</code> or <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">.yml</code> file, a YAML file dropped together with image assets, or a ZIP archive containing <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">exam.yaml</code> plus an <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">images/</code> folder.</p>
        <DocsTable
          columns={['Format', 'When to use it', 'Notes']}
          rows={[
            ['Single YAML file', 'Text-only exams or remote images', 'Fastest way to iterate while authoring.'],
            ['YAML + image files', 'Local image assets beside the YAML', 'Drop all files together on /upload.'],
            ['ZIP bundle', 'Portable package for sharing or archiving', 'Best for exams with multiple images.'],
          ]}
        />
      </section>

      <section className="scroll-mt-28" data-doc-section id="configuring-session">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Configuring Your Session</h2>
        <p>After uploading a YAML file, PaperBench shows a configuration panel where you can customize which questions to include and how the session runs.</p>
        <Card className="surface-strong p-5">
          <p className="text-sm leading-7 text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Difficulty:</strong> Choose easy, medium, and/or hard questions.</p>
          <p className="text-sm leading-7 text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Topics:</strong> Filter by the required per-question <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">tags</code> field.</p>
          <p className="text-sm leading-7 text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Question Types:</strong> Limit the session to single choice, multiple choice, true/false, or type answer.</p>
          <p className="text-sm leading-7 text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Question Count:</strong> Use all matching questions or choose a smaller custom set.</p>
          <p className="text-sm leading-7 text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Timer Options:</strong> Run with the YAML timer, override the timing, or switch to untimed practice mode.</p>
        </Card>
        <div className="rounded-2xl border-l-[3px] border-[var(--accent)] bg-[var(--bg-elevated)] px-4 py-4 italic text-[var(--text-secondary)]">
          If your filters produce zero matching questions, PaperBench shows a diagnostic message and disables the start button until at least one question matches.
        </div>
      </section>

      <section className="scroll-mt-28" data-doc-section id="exam-metadata">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Exam Metadata</h2>
        <p>The <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">exam</code> block defines the human-readable information shown on briefing, results, history, and exported reports.</p>
        <YamlExample code={minimalExamYaml} />
      </section>

      <section className="scroll-mt-28" data-doc-section id="settings">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Settings</h2>
        <p>The <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">settings</code> block controls timing, review permissions, shuffling, pass thresholds, and optional negative marking behavior.</p>
        <DocsTable
          columns={['Field', 'Required', 'Description']}
          rows={[
            ['timer_mode', 'Yes', 'Use global or per_question timing.'],
            ['total_time_minutes', 'Global only', 'Total duration for the attempt.'],
            ['allow_review', 'No', 'False locks earlier questions during timed exams.'],
            ['show_correct_after_submit', 'No', 'Controls whether review reveals answers and explanations.'],
            ['pass_percentage', 'No', 'Threshold used for pass/fail status.'],
            ['negative_marking', 'No', 'Optional scoring penalty config.'],
            ['theme', 'No', 'dark, light, or system.'],
          ]}
        />
      </section>

      <section className="scroll-mt-28" data-doc-section id="sections-questions">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Sections & Questions</h2>
        <p>Every question needs an <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">id</code>, <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">type</code>, difficulty, points, prompt text, and at least one topic tag.</p>
        <DocsTable
          columns={['Rule', 'Meaning']}
          rows={[
            ['tags required', 'Every question must include one or more lowercase kebab-case topic tags.'],
            ['difficulty separate', 'Use the difficulty field for easy / medium / hard. Do not use those values as tags.'],
            ['unique ids', 'Question ids must be globally unique across the full exam.'],
          ]}
        />
      </section>

      <section className="scroll-mt-28" data-doc-section id="single-choice">
        <h3 className="text-xl font-medium text-[var(--text-primary)]">Single Choice</h3>
        <p>The candidate selects one answer from 2 to 6 options. Single-choice questions are auto-scored.</p>
        <YamlExample code={singleChoiceYaml} />
      </section>

      <section className="scroll-mt-28" data-doc-section id="multiple-choice">
        <h3 className="text-xl font-medium text-[var(--text-primary)]">Multiple Choice</h3>
        <p>Multiple-choice questions support partial credit when <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">partial_credit</code> is enabled.</p>
        <YamlExample code={multipleChoiceYaml} />
      </section>

      <section className="scroll-mt-28" data-doc-section id="true-false">
        <h3 className="text-xl font-medium text-[var(--text-primary)]">True / False</h3>
        <p>Use true / false for quick binary checks. The answer must be the string <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">"true"</code> or <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">"false"</code>.</p>
        <YamlExample code={trueFalseYaml} />
      </section>

      <section className="scroll-mt-28" data-doc-section id="type-answer">
        <h3 className="text-xl font-medium text-[var(--text-primary)]">Type Answer</h3>
        <p>Type-answer questions are manually reviewed and must use <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">points: 0</code>.</p>
        <YamlExample code={typeAnswerYaml} />
      </section>

      <section className="scroll-mt-28" data-doc-section id="code-snippets">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Code Snippets</h2>
        <p>Any question type can include a <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">code_snippet</code> field.</p>
        <YamlExample code={codeSnippetYaml} />
      </section>

      <section className="scroll-mt-28" data-doc-section id="image-support">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Image Support</h2>
        <p>Any question can include an image for UI mockups, diagrams, charts, or visual analysis.</p>
        <YamlExample code={imageYaml} />
        <DocsImage alt="Grid layout example" caption="Local image references can be bundled alongside YAML or zipped for sharing." src={sampleImageMap['images/layout-diagram.svg']} />
      </section>

      <section className="scroll-mt-28" data-doc-section id="partial-credit">
        <h3 className="text-xl font-medium text-[var(--text-primary)]">Partial Credit</h3>
        <p>For <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-sm text-[var(--text-primary)]">multiple_choice</code> only, partial credit rewards partially correct selections while penalizing wrong extras.</p>
      </section>

      <section className="scroll-mt-28" data-doc-section id="negative-marking">
        <h3 className="text-xl font-medium text-[var(--text-primary)]">Negative Marking</h3>
        <p>Negative marking deducts points for wrong answers and never applies to unanswered questions or manual-review prompts.</p>
      </section>

      <section className="scroll-mt-28" data-doc-section id="timer-modes">
        <h3 className="text-xl font-medium text-[var(--text-primary)]">Timer Modes</h3>
        <p>PaperBench supports global timers, per-question timers, and untimed practice sessions configured from the setup screen.</p>
      </section>

      <section className="scroll-mt-28" data-doc-section id="export-markdown">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Markdown Export</h2>
        <p>Markdown reports are meant for human-readable reviews and can bundle local image assets into a ZIP.</p>
        <YamlExample code={markdownExportSample} />
      </section>

      <section className="scroll-mt-28" data-doc-section id="export-yaml">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">YAML Answer Sheet</h2>
        <p>YAML export creates a machine-readable answer sheet for evaluation or diffing.</p>
        <YamlExample code={yamlExportSample} />
      </section>

      <section className="scroll-mt-28" data-doc-section id="export-pdf">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">PDF Export</h2>
        <p>PDF export captures the rendered dashboard or review surface so you can archive or print a visual report.</p>
      </section>

      <section className="scroll-mt-28" data-doc-section id="examples">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Examples</h2>
        <p>Use the bundled samples to see how PaperBench exams are structured in practice.</p>
        <div className="space-y-4">
          <ExampleCard
            description="Frontend sample with layout, semantics, images, and a written-response prompt."
            filename="frontend-assessment.yaml"
            metadata="Frontend \u00B7 Images \u00B7 Code snippets"
            title="Frontend Developer Assessment"
            yaml={frontendAssessmentYaml}
          />
          <ExampleCard
            description="Machine learning sample covering LoRA, data prep, evaluation, and free-text reasoning."
            filename="ml-fine-tuning.yaml"
            metadata="ML \u00B7 Topic tags \u00B7 Partial credit"
            title={mlExample?.title ?? 'ML Fine-Tuning Assessment'}
            yaml={mlExample?.yaml ?? ''}
          />
          <ExampleCard
            description="A tiny starter file that shows the minimum valid structure, including required tags."
            filename="minimal-exam.yaml"
            metadata="Minimal \u00B7 Tagged \u00B7 Global timer"
            title="Minimal Exam"
            yaml={minimalExamYaml}
          />
        </div>
      </section>

      <section className="scroll-mt-28" data-doc-section id="download-samples">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Sample YAML Files</h2>
        <p>The bundled examples are the fastest way to understand the schema in context.</p>
        <Card className="surface-strong p-5">
          <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
            <li>Minimal Quiz starter file</li>
            <li>Frontend Developer Assessment</li>
            <li>{mlExample?.title ?? 'ML Fine-Tuning Assessment'}</li>
            <li>{apiExample?.title ?? 'API Design and Backend Assessment'}</li>
          </ul>
        </Card>
      </section>

      <section className="scroll-mt-28" data-doc-section id="field-reference">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Field Reference</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-medium text-[var(--text-primary)]">Question Fields</h3>
            <DocsTable
              columns={['Field', 'Type', 'Required', 'Notes']}
              rows={[
                ['id', 'string', 'Yes', 'Globally unique across all sections.'],
                ['type', 'string', 'Yes', 'single_choice, multiple_choice, true_false, type_answer.'],
                ['difficulty', 'string', 'Yes', 'easy, medium, or hard.'],
                ['points', 'integer', 'Yes', '>= 1 for scored questions, 0 for type_answer.'],
                ['question', 'string', 'Yes', 'Prompt shown to the candidate.'],
                ['tags', 'string[]', 'Yes', 'One or more lowercase kebab-case topic tags.'],
                ['time_limit_seconds', 'integer', 'No', 'Used in per-question timer mode.'],
                ['code_snippet', 'object', 'No', '{ language, code }.'],
                ['image', 'object', 'No', '{ src, alt, width?, caption?, position? }.'],
                ['explanation', 'string', 'No', 'Shown after submission on review when enabled.'],
              ]}
            />
          </div>

          <div>
            <h3 className="text-xl font-medium text-[var(--text-primary)]">Settings Fields</h3>
            <DocsTable
              columns={['Field', 'Type', 'Required', 'Default', 'Notes']}
              rows={[
                ['timer_mode', 'string', 'Yes', '-', 'global or per_question.'],
                ['total_time_minutes', 'integer', 'If global', '-', 'Total exam duration.'],
                ['shuffle_questions', 'boolean', 'No', 'false', 'Randomize question order.'],
                ['shuffle_options', 'boolean', 'No', 'false', 'Randomize option order when supported.'],
                ['allow_review', 'boolean', 'No', 'true', 'False creates forward-only timed exams.'],
                ['show_correct_after_submit', 'boolean', 'No', 'true', 'Controls answer visibility in review.'],
                ['pass_percentage', 'integer', 'No', 'null', 'Pass/fail threshold for scored questions.'],
                ['theme', 'string', 'No', 'dark', 'dark, light, or system.'],
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}


