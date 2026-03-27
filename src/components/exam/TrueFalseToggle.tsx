// ================================================================
// FILE: src/components/exam/TrueFalseToggle.tsx
// PURPOSE: True/false answer control.
// DEPENDENCIES: react, OptionCard
// ================================================================

import { OptionCard } from './OptionCard';

/**
 * TrueFalseToggle renders true/false answer choices.
 */
export function TrueFalseToggle({
  value,
  onChange,
  disabled = false,
}: {
  value?: 'true' | 'false';
  onChange: (value: 'true' | 'false') => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <OptionCard disabled={disabled} label="True" onClick={() => onChange('true')} selected={value === 'true'} />
      <OptionCard disabled={disabled} label="False" onClick={() => onChange('false')} selected={value === 'false'} />
    </div>
  );
}
