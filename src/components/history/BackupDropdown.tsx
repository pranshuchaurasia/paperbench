// ================================================================
// FILE: src/components/history/BackupDropdown.tsx
// PURPOSE: Backup-all action menu for complete history exports.
// DEPENDENCIES: react, lucide-react, src/components/ui/*, src/store
// ================================================================

import { Download } from 'lucide-react';
import { Dropdown } from '../ui/Dropdown';
import { useExamStore } from '../../store/examStore';

export function BackupDropdown({ disabled = false }: { disabled?: boolean }) {
  const exportAllHistory = useExamStore((state) => state.exportAllHistory);

  if (disabled) {
    return (
      <button className="surface inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] opacity-60" disabled type="button">
        <Download className="h-4 w-4" />
        Backup All
      </button>
    );
  }

  return (
    <Dropdown
      label="Backup All"
      options={[
        { label: 'Backup as JSON (.json)', onSelect: () => void exportAllHistory('json') },
        { label: 'Backup as YAML (.yaml)', onSelect: () => void exportAllHistory('yaml') },
      ]}
    />
  );
}
