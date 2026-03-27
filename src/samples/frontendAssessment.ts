// ================================================================
// FILE: src/samples/frontendAssessment.ts
// PURPOSE: Bundled sample exam content for the landing page Try Sample flow.
// DEPENDENCIES: None
// ================================================================

export const frontendAssessmentYaml = `exam:
  title: "Frontend Developer Assessment"
  description: "A sample assessment covering layout, semantics, accessibility, and JavaScript."
  version: "1.0"
  author: "PaperBench Team"
  created_at: "2026-03-26"

settings:
  timer_mode: "global"
  total_time_minutes: 20
  shuffle_questions: false
  shuffle_options: false
  allow_review: true
  show_correct_after_submit: true
  pass_percentage: 70
  negative_marking:
    enabled: false
  theme: "dark"

sections:
  - name: "Core Frontend"
    description: "Markup, layout, and browser behavior."
    questions:
      - id: "fe-1"
        type: "single_choice"
        difficulty: "easy"
        points: 2
        question: "Which HTML element is best suited for the main content of a page?"
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
        explanation: "The <main> landmark represents the dominant content of the document."
        tags: ["html", "semantics"]

      - id: "fe-2"
        type: "multiple_choice"
        difficulty: "medium"
        points: 3
        question: "Which CSS properties can participate in a flex formatting context?"
        image:
          src: "images/layout-diagram.svg"
          alt: "A three-column layout with a wide center column."
          caption: "A simple reference layout for the question."
          position: "below_question"
        options:
          - id: "a"
            text: "justify-content"
          - id: "b"
            text: "align-items"
          - id: "c"
            text: "float"
          - id: "d"
            text: "gap"
        correct_answers: ["a", "b", "d"]
        partial_credit: true
        explanation: "Flex alignment and spacing live on the flex container; float does not."
        tags: ["css", "layout"]

      - id: "fe-3"
        type: "true_false"
        difficulty: "easy"
        points: 1
        question: "A button without a type attribute defaults to submit inside a form."
        correct_answer: "true"
        explanation: "Browsers default <button> to type='submit' when placed in a form."
        tags: ["html", "forms"]

      - id: "fe-4"
        type: "type_answer"
        difficulty: "hard"
        points: 0
        question: "Explain how you would debug a layout shift affecting a responsive dashboard."
        min_characters: 80
        max_characters: 1200
        placeholder: "Describe your investigation and fix strategy..."
        reference_answer: "A strong answer covers reproduction, DevTools layout inspection, CLS sources, responsive breakpoints, and targeted CSS fixes."
        tags: ["debugging", "performance"]`;

