// ================================================================
// FILE: src/routes/upload.tsx
// PURPOSE: Dedicated upload page for YAML exams and ZIP bundles.
// DEPENDENCIES: tanstack router, react, sonner, lucide-react, src/store
// ================================================================

import { createRoute, useNavigate } from '@tanstack/react-router';
import { CheckCircle2, Upload } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { frontendAssessmentYaml } from '../samples/frontendAssessment';
import { sampleImageMap } from '../samples/sampleImages';
import { useExamStore } from '../store/examStore';
import { readUploadBundle } from '../utils/zipHandler';
import { rootRoute } from './__root';

interface UploadSummary {
  examTitle: string;
  questionCount: number;
  sectionCount: number;
  timerMode: string;
  filenames: string[];
  warnings: string[];
}

export function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const loadExam = useExamStore((state) => state.loadExam);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFiles = (files: File[]) => {
    const hasSupported = files.some((file) => /\.(ya?ml|zip|png|jpe?g|gif|svg|webp)$/i.test(file.name));
    if (!hasSupported) {
      throw new Error('Invalid file type. Please upload .yaml, .yml, or .zip files.');
    }
  };

  const handleReset = () => {
    setSummary(null);
    setErrors([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFiles = async (files: File[]) => {
    if (!files.length) {
      return;
    }

    try {
      validateFiles(files);
      setLoading(true);
      setErrors([]);
      setSummary(null);
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      const bundle = await readUploadBundle(files);
      const warnings = loadExam(bundle.yamlText, bundle.imageMap);
      const loadedConfig = useExamStore.getState().examConfig;
      if (!loadedConfig) {
        throw new Error('Exam could not be loaded.');
      }
      setSummary({
        examTitle: loadedConfig.exam.title,
        questionCount: loadedConfig.sections.reduce((sum, section) => sum + section.questions.length, 0),
        sectionCount: loadedConfig.sections.length,
        timerMode: loadedConfig.settings.timer_mode === 'global'
          ? `${loadedConfig.settings.total_time_minutes ?? 0} min`
          : 'Per-question',
        filenames: files.map((file) => file.name),
        warnings: warnings.map((warning) => `${warning.path}: ${warning.message}`),
      });
      toast.success('Exam package loaded. Continue to the setup page when ready.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      setErrors(message.split('\n').filter(Boolean));
      toast.error(message);
    } finally {
      setLoading(false);
      setDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFiles(Array.from(event.dataTransfer.files));
  };

  const loadSample = () => {
    try {
      loadExam(frontendAssessmentYaml, sampleImageMap);
      navigate({ to: '/exam/setup' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sample could not be loaded.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-[640px] flex-col justify-center py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Upload your exam</h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">Drop a YAML file, YAML with images, or a ZIP bundle.</p>
      </div>

      <div
        className={`mt-8 flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-8 text-center transition ${dragging ? 'border-[var(--accent)] bg-[var(--accent-subtle)] shadow-[0_0_40px_rgba(139,92,246,0.12)]' : 'border-[var(--border)] bg-[var(--bg-surface)]'}`}
        onClick={() => inputRef.current?.click()}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        <Upload className={`h-12 w-12 ${dragging ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`} />
        <h2 className="mt-5 text-xl font-medium text-[var(--text-primary)]">Drag & drop files here</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">or click to browse</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-[var(--text-tertiary)]">
          <span className="rounded-full bg-[var(--bg-hover)] px-3 py-1">YAML / YML</span>
          <span className="rounded-full bg-[var(--bg-hover)] px-3 py-1">ZIP with images</span>
          <span className="rounded-full bg-[var(--bg-hover)] px-3 py-1">PNG / JPG / SVG</span>
        </div>
        <input
          ref={inputRef}
          accept=".yaml,.yml,.zip,.png,.jpg,.jpeg,.gif,.svg,.webp"
          className="hidden"
          multiple
          onChange={(event) => handleFiles(Array.from(event.target.files ?? []))}
          type="file"
        />
      </div>

      {loading ? (
        <Card className="mt-6 space-y-3">
          <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--bg-hover)]" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--bg-hover)]" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--bg-hover)]" />
        </Card>
      ) : null}

      {summary ? (
        <Card className="mt-6 space-y-4 border-emerald-500/20 bg-[var(--success-subtle)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Ready to go</h3>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{summary.examTitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-secondary)]">Title: <span className="text-[var(--text-primary)]">{summary.examTitle}</span></div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-secondary)]">Questions: <span className="text-[var(--text-primary)]">{summary.questionCount}</span></div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-secondary)]">Sections: <span className="text-[var(--text-primary)]">{summary.sectionCount}</span></div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-secondary)]">Timer: <span className="text-[var(--text-primary)]">{summary.timerMode}</span></div>
          </div>
          {summary.warnings.length > 0 ? (
            <details className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-sm" data-testid="upload-warnings-details">
              <summary className="cursor-pointer font-medium text-[var(--warning)]">
                {summary.warnings.length} warning{summary.warnings.length > 1 ? 's' : ''} - exam will still load
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[var(--text-secondary)]">
                {summary.warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            </details>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate({ to: '/exam/setup' })} type="button">Continue to Exam</Button>
            <Button onClick={handleReset} type="button" variant="ghost">Upload another file</Button>
          </div>
        </Card>
      ) : null}

      {errors.length ? (
        <Card className="mt-6 border-red-500/25 bg-[var(--danger-subtle)]">
          <h3 className="text-lg font-medium text-[var(--danger)]">Validation errors</h3>
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto text-sm text-[var(--text-primary)]">
            {errors.map((error) => <p key={error}>{error}</p>)}
          </div>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">Fix the YAML or bundle contents, then re-upload.</p>
        </Card>
      ) : null}

      <button className="mt-6 self-center text-sm text-[var(--accent)] transition hover:underline" onClick={loadSample} type="button">
        Try a sample exam
      </button>
    </div>
  );
}

export const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'upload',
  component: UploadPage,
});
