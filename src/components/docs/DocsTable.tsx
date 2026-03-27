// ================================================================
// FILE: src/components/docs/DocsTable.tsx
// PURPOSE: Styled table for documentation reference sections.
// DEPENDENCIES: react
// ================================================================

export function DocsTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--bg-hover)] text-[var(--text-primary)]">
          <tr>
            {columns.map((column) => (
              <th className="px-4 py-3 font-medium" key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr className="border-t border-[var(--border)]" key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td className="px-4 py-3 align-top text-[var(--text-secondary)]" key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
