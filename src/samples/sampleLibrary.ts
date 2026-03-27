// ================================================================
// FILE: src/samples/sampleLibrary.ts
// PURPOSE: Bundled sample exam catalog shown on the landing page.
// DEPENDENCIES: src/samples/frontendAssessment, src/samples/sampleImages
// ================================================================

import { frontendAssessmentYaml } from './frontendAssessment';
import { sampleImageMap } from './sampleImages';

const mlFineTuningYaml = `exam:
  title: "Machine Learning Fine-Tuning Assessment"
  description: "A bundled assessment covering LoRA, data prep, evaluation, and tuning strategy."
  version: "1.0"
  author: "PaperBench Team"
  created_at: "2026-03-26"

settings:
  timer_mode: "global"
  total_time_minutes: 25
  shuffle_questions: true
  shuffle_options: true
  allow_review: true
  show_correct_after_submit: true
  pass_percentage: 65
  negative_marking:
    enabled: false
  theme: "dark"

sections:
  - name: "Foundations"
    questions:
      - id: "ml-1"
        type: "single_choice"
        difficulty: "easy"
        points: 2
        question: "What is the main goal of fine-tuning a pre-trained language model?"
        options:
          - id: "a"
            text: "To retrain the entire web corpus from scratch"
          - id: "b"
            text: "To adapt a pre-trained model to a narrower task or domain"
          - id: "c"
            text: "To reduce tokenization errors only"
          - id: "d"
            text: "To eliminate the need for evaluation"
        correct_answer: "b"
        explanation: "Fine-tuning transfers general model knowledge into a task-specific or domain-specific use case."
        tags: ["fundamentals"]
      - id: "ml-2"
        type: "true_false"
        difficulty: "easy"
        points: 1
        question: "Fine-tuning usually uses a lower learning rate than pre-training."
        correct_answer: "true"
        explanation: "Lower rates reduce catastrophic forgetting."
        tags: ["hyperparameters"]
      - id: "ml-3"
        type: "multiple_choice"
        difficulty: "medium"
        points: 3
        question: "Which are common reasons to fine-tune instead of using zero-shot prompting?"
        options:
          - id: "a"
            text: "Domain-specific language matters"
          - id: "b"
            text: "Specific output formatting is required"
          - id: "c"
            text: "The context window should become larger"
          - id: "d"
            text: "Zero-shot quality is below target"
        correct_answers: ["a", "b", "d"]
        partial_credit: true
        explanation: "Context window size is architectural; the others are common reasons to fine-tune."
        tags: ["fundamentals", "prompting"]
  - name: "Practice"
    questions:
      - id: "ml-4"
        type: "single_choice"
        difficulty: "hard"
        points: 4
        question: "What is the main advantage of LoRA?"
        options:
          - id: "a"
            text: "It adds trainable low-rank adapters while freezing base weights"
          - id: "b"
            text: "It guarantees zero overfitting"
          - id: "c"
            text: "It removes the need for validation"
          - id: "d"
            text: "It prevents hallucination entirely"
        correct_answer: "a"
        explanation: "LoRA is parameter-efficient because most original model weights remain frozen."
        tags: ["lora", "peft"]
      - id: "ml-5"
        type: "type_answer"
        difficulty: "hard"
        points: 0
        question: "Describe how you would prepare a domain dataset before fine-tuning a support assistant."
        min_characters: 80
        max_characters: 1200
        placeholder: "Describe cleaning, structure, splits, and quality checks..."
        reference_answer: "A strong answer covers cleaning, formatting into instruction-response pairs, validation splits, and quality filtering."
        tags: ["data", "practical"]`;

const apiDesignYaml = `exam:
  title: "API Design and Backend Assessment"
  description: "A bundled assessment covering REST semantics, validation, security, and data modeling."
  version: "1.0"
  author: "PaperBench Team"
  created_at: "2026-03-26"

settings:
  timer_mode: "per_question"
  shuffle_questions: false
  shuffle_options: false
  allow_review: false
  show_correct_after_submit: false
  pass_percentage: 70
  negative_marking:
    enabled: false
  theme: "light"

sections:
  - name: "API Fundamentals"
    questions:
      - id: "api-1"
        type: "single_choice"
        difficulty: "easy"
        points: 2
        time_limit_seconds: 45
        question: "Which HTTP method is most appropriate for partially updating a resource?"
        options:
          - id: "a"
            text: "GET"
          - id: "b"
            text: "PATCH"
          - id: "c"
            text: "POST"
          - id: "d"
            text: "TRACE"
        correct_answer: "b"
        explanation: "PATCH is typically used for partial updates."
        tags: ["http"]
      - id: "api-2"
        type: "multiple_choice"
        difficulty: "medium"
        points: 3
        time_limit_seconds: 60
        question: "Which practices improve API reliability?"
        options:
          - id: "a"
            text: "Strict input validation"
          - id: "b"
            text: "Idempotent retry-safe operations where appropriate"
          - id: "c"
            text: "Returning stack traces to clients in production"
          - id: "d"
            text: "Consistent status codes"
        correct_answers: ["a", "b", "d"]
        partial_credit: true
        explanation: "Validation, idempotency, and consistent responses help reliability; stack traces should stay server-side."
        tags: ["validation", "reliability"]
      - id: "api-3"
        type: "true_false"
        difficulty: "easy"
        points: 1
        time_limit_seconds: 30
        question: "Authentication answers who the caller is; authorization answers what they may do."
        correct_answer: "true"
        explanation: "That is the standard distinction between authn and authz."
        tags: ["security"]
      - id: "api-4"
        type: "type_answer"
        difficulty: "hard"
        points: 0
        time_limit_seconds: 90
        question: "Design a versioning strategy for a public API that must evolve without breaking existing clients."
        min_characters: 100
        max_characters: 1500
        placeholder: "Discuss versioning, deprecation, compatibility, and rollout..."
        reference_answer: "A strong answer covers versioning policy, backward compatibility, deprecation windows, and migration communication."
        tags: ["versioning", "architecture"]`;

export interface SampleExamDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  timerLabel: string;
  reviewLabel: string;
  tags: string[];
  yaml: string;
  imageMap: Record<string, string>;
  estimatedMinutes: number;
  questionCount: number;
  theme: 'dark' | 'light';
}

export const sampleExamLibrary: SampleExamDefinition[] = [
  {
    id: 'frontend-assessment',
    title: 'Frontend Developer Assessment',
    subtitle: 'HTML, CSS, accessibility, and debugging',
    description: 'A visual frontend-focused sample with layout, semantics, and free-text debugging questions.',
    category: 'Frontend',
    level: 'Intermediate',
    timerLabel: 'Global timer',
    reviewLabel: 'Review enabled',
    tags: ['Accessibility', 'Debugging', 'Layouts'],
    yaml: frontendAssessmentYaml,
    imageMap: sampleImageMap,
    estimatedMinutes: 20,
    questionCount: 4,
    theme: 'dark',
  },
  {
    id: 'ml-finetuning',
    title: 'ML Fine-Tuning Assessment',
    subtitle: 'LoRA, tuning strategy, and dataset preparation',
    description: 'A bundled machine learning sample covering parameter-efficient fine-tuning and evaluation basics.',
    category: 'Machine Learning',
    level: 'Advanced',
    timerLabel: 'Global timer',
    reviewLabel: 'Review enabled',
    tags: ['LoRA', 'Data Prep', 'Evaluation'],
    yaml: mlFineTuningYaml,
    imageMap: {},
    estimatedMinutes: 25,
    questionCount: 5,
    theme: 'dark',
  },
  {
    id: 'api-design',
    title: 'API Design and Backend Assessment',
    subtitle: 'REST semantics, security, and versioning',
    description: 'A per-question timed backend-oriented sample that also exercises forward-only mode.',
    category: 'Backend',
    level: 'Intermediate',
    timerLabel: 'Per-question timer',
    reviewLabel: 'Forward only',
    tags: ['REST', 'Security', 'Versioning'],
    yaml: apiDesignYaml,
    imageMap: {},
    estimatedMinutes: 10,
    questionCount: 4,
    theme: 'light',
  },
];

