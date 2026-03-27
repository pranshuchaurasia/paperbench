// ================================================================
// FILE: src/utils/answers.ts
// PURPOSE: Shared helpers for determining whether an answer is actually filled.
// DEPENDENCIES: src/types
// ================================================================

import type { UserAnswer } from '../types';

export function isAnswerFilled(answer: UserAnswer | null | undefined): boolean {
  if (!answer) {
    return false;
  }

  switch (answer.type) {
    case 'single_choice':
      return answer.selectedOptionId.trim().length > 0;
    case 'multiple_choice':
      return answer.selectedOptionIds.length > 0;
    case 'true_false':
      return answer.selectedValue === 'true' || answer.selectedValue === 'false';
    case 'type_answer':
      return answer.text.trim().length > 0;
    default:
      return false;
  }
}
