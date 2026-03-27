// ================================================================
// FILE: src/routes/docs.tsx
// PURPOSE: Comprehensive YAML documentation page with examples and previews.
// DEPENDENCIES: tanstack router, react, src/components/docs/*
// ================================================================

import { createRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { DocsContent, docsSidebarGroups } from '../components/docs/DocsContent';
import { DocsDownloadButton } from '../components/docs/DocsDownloadButton';
import { DocsSidebar } from '../components/docs/DocsSidebar';
import { rootRoute } from './__root';

function DocsPage() {
  const [activeId, setActiveId] = useState(docsSidebarGroups[0].items[0].id);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-doc-section]'));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.3, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[720px]">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--accent)]">Documentation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Write YAML in your own editor. Run it in PaperBench.</h1>
          <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">PaperBench is an exam runner, not a YAML IDE. Use VS Code or your preferred editor to author exam files, then upload them into the app for briefing, live delivery, scoring, review, and export.</p>
        </div>
        <DocsDownloadButton />
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,720px)] lg:items-start">
        <DocsSidebar activeId={activeId} groups={docsSidebarGroups} />
        <div className="w-full max-w-[720px] scroll-smooth">
          <DocsContent />
        </div>
      </div>
    </div>
  );
}

export const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'docs',
  component: DocsPage,
});

