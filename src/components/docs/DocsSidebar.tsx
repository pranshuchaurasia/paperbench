// ================================================================
// FILE: src/components/docs/DocsSidebar.tsx
// PURPOSE: Sticky table of contents for the documentation page.
// DEPENDENCIES: react
// ================================================================

export interface DocsSidebarGroup {
  title: string;
  items: Array<{ id: string; label: string }>;
}

export function DocsSidebar({ groups, activeId }: { groups: DocsSidebarGroup[]; activeId: string }) {
  return (
    <aside className="sticky top-24 hidden h-fit w-full max-w-[240px] lg:block">
      <div className="surface-strong rounded-2xl p-4">
        {groups.map((group) => (
          <div className="mb-5 last:mb-0" key={group.title}>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-tertiary)]">{group.title}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => (
                <a
                  className={`block border-l-2 pl-3 py-1.5 text-sm transition ${activeId === item.id ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  href={`#${item.id}`}
                  key={item.id}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
