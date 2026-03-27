// ================================================================
// FILE: src/components/docs/DocsImage.tsx
// PURPOSE: Styled documentation image with caption.
// DEPENDENCIES: react
// ================================================================

export function DocsImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="space-y-3">
      <img alt={alt} className="w-full rounded-2xl border border-[var(--border)]" src={src} />
      {caption ? <figcaption className="text-xs italic text-[var(--text-tertiary)]">{caption}</figcaption> : null}
    </figure>
  );
}
