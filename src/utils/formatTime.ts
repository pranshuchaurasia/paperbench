// ================================================================
// FILE: src/utils/formatTime.ts
// PURPOSE: Human-readable timer formatting helpers.
// DEPENDENCIES: None
// ================================================================

/**
 * Format seconds as HH:MM:SS or MM:SS based on duration length.
 *
 * @param totalSeconds - Remaining or elapsed seconds.
 * @returns Display-ready time string.
 */
export function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  }

  return [minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}
