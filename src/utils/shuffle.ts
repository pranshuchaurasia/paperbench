// ================================================================
// FILE: src/utils/shuffle.ts
// PURPOSE: Deterministic-friendly array shuffle helper for questions/options.
// DEPENDENCIES: None
// ================================================================

/**
 * Return a shallowly shuffled copy of an array.
 *
 * @param items - Source list to shuffle.
 * @returns New array with randomized order.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
