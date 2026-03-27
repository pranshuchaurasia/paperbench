// ================================================================
// FILE: src/types/answers.ts
// PURPOSE: Serializable answer unions used in state, exports, and scoring.
// DEPENDENCIES: None
// ================================================================

export type UserAnswer =
  | { type: 'single_choice'; selectedOptionId: string }
  | { type: 'multiple_choice'; selectedOptionIds: string[] }
  | { type: 'true_false'; selectedValue: 'true' | 'false' }
  | { type: 'type_answer'; text: string };
