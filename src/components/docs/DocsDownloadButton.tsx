// ================================================================
// FILE: src/components/docs/DocsDownloadButton.tsx
// PURPOSE: Download the in-app docs as a standalone README file.
// DEPENDENCIES: lucide-react, src/components/ui/Button, src/services
// ================================================================

import { Download } from 'lucide-react';
import { useService } from '../../services/ServiceProvider';
import { Button } from '../ui/Button';

export function DocsDownloadButton() {
  const exportService = useService().export;

  const handleDownload = () => {
    const content = exportService.exportDocsAsReadme();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'PaperBench-Documentation.md';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      className="border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--border-hover)]"
      onClick={handleDownload}
      type="button"
      variant="ghost"
    >
      <Download className="h-4 w-4" />
      Download README
    </Button>
  );
}


