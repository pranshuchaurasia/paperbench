// ================================================================
// FILE: src/utils/slugify.ts
// PURPOSE: Filename-safe slug generation for exports and IDs.
// DEPENDENCIES: None
// ================================================================

/**
 * Convert a label into a lowercase dash-separated slug.
 *
 * @param value - Source text.
 * @returns Normalized slug.
 */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
