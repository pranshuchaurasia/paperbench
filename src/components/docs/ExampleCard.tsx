// ================================================================
// FILE: src/components/docs/ExampleCard.tsx
// PURPOSE: Downloadable sample exam card for docs.
// DEPENDENCIES: react, src/components/ui/*, src/components/docs/YamlExample
// ================================================================

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { YamlExample } from './YamlExample';

function downloadTextFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: 'text/yaml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExampleCard({
  title,
  description,
  metadata,
  filename,
  yaml,
}: {
  title: string;
  description: string;
  metadata: string;
  filename: string;
  yaml: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-lg font-medium text-[var(--text-primary)]">{title}</h4>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">{metadata}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => downloadTextFile(filename, yaml)} type="button" variant="secondary">
            <Download className="h-4 w-4" />
            Download YAML
          </Button>
          <Button onClick={() => setOpen((value) => !value)} type="button" variant="subtle">
            {open ? 'Hide Preview' : 'Preview'}
          </Button>
        </div>
      </div>
      {open ? <YamlExample code={yaml} /> : null}
    </Card>
  );
}
