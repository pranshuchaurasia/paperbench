// ================================================================
// FILE: src/components/ui/ProgressRing.tsx
// PURPOSE: Circular progress indicator.
// DEPENDENCIES: react
// ================================================================

/**
 * ProgressRing renders an SVG donut with a percentage label.
 */
export function ProgressRing({ value }: { value: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((Math.max(0, Math.min(100, value)) / 100) * circumference);

  return (
    <svg className="h-48 w-48" viewBox="0 0 180 180">
      <circle cx="90" cy="90" fill="none" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
      <circle
        cx="90"
        cy="90"
        fill="none"
        r={radius}
        stroke="url(#progressGradient)"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        strokeWidth="16"
        transform="rotate(-90 90 90)"
      />
      <defs>
        <linearGradient id="progressGradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <text x="90" y="92" fill="currentColor" fontSize="28" fontWeight="600" textAnchor="middle">
        {value.toFixed(1)}%
      </text>
    </svg>
  );
}
