// ================================================================
// FILE: src/components/exam/Timer.tsx
// PURPOSE: Visual exam countdown.
// DEPENDENCIES: react, src/utils/formatTime
// ================================================================

import { formatTime } from '../../utils/formatTime';

/**
 * Timer renders the remaining time with urgency colors and a ring.
 */
export function Timer({ seconds, totalSeconds }: { seconds: number; totalSeconds: number }) {
  const clamped = Math.max(0, seconds);
  const ratio = totalSeconds > 0 ? clamped / totalSeconds : 0;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.max(0, Math.min(1, ratio)) * circumference);
  const stroke = ratio <= 0.1 ? 'var(--danger)' : ratio <= 0.25 ? 'var(--warning)' : 'var(--accent)';
  const textClassName = ratio <= 0.05 ? 'text-[var(--danger)] animate-pulse' : ratio <= 0.25 ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]';

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" fill="none" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle
            cx="28"
            cy="28"
            fill="none"
            r={radius}
            stroke={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth="4"
          />
        </svg>
      </div>
      <div>
        <div className={`font-mono text-xl font-semibold ${textClassName}`}>{formatTime(clamped)}</div>
        <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Time Left</div>
      </div>
    </div>
  );
}
