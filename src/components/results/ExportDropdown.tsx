// ================================================================
// FILE: src/components/results/ExportDropdown.tsx
// PURPOSE: Trigger result exports in multiple formats.
// DEPENDENCIES: src/components/ui/Dropdown, src/utils/slugify
// ================================================================

import type { ExamConfig, ExamResult, UserAnswer } from '../../types';
import { useService } from '../../services/ServiceProvider';
import { slugify } from '../../utils/slugify';
import { Dropdown } from '../ui/Dropdown';

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * ExportDropdown provides markdown, YAML, and PDF export actions.
 */
export function ExportDropdown({
  config,
  result,
  answers,
  imageMap,
  targetElementId,
}: {
  config: ExamConfig;
  result: ExamResult;
  answers: Record<string, UserAnswer>;
  imageMap: Record<string, string>;
  targetElementId: string;
}) {
  const exportService = useService().export;
  const filenameBase = `paperbench-${slugify(config.exam.title)}-${new Date().toISOString().slice(0, 10)}`;

  return (
    <Dropdown
      label="Export"
      options={[
        {
          label: 'Markdown',
          onSelect: async () => {
            const file = await exportService.exportAsMarkdown(config, result, answers, imageMap);
            downloadBlob(`${filenameBase}.${file.extension}`, file.blob);
          },
        },
        {
          label: 'YAML',
          onSelect: async () => {
            const file = await exportService.exportAsYaml(config, result, answers);
            downloadBlob(`${filenameBase}.${file.extension}`, file.blob);
          },
        },
        {
          label: 'PDF',
          onSelect: async () => {
            await exportService.exportAsPdf(targetElementId, `${filenameBase}.pdf`);
          },
        },
      ]}
    />
  );
}

