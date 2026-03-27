// ================================================================
// FILE: src/components/exam/CodeBlock.tsx
// PURPOSE: Syntax-highlighted code snippet renderer.
// DEPENDENCIES: prism-react-renderer, react, lucide-react
// ================================================================

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

/**
 * CodeBlock renders source code with syntax highlighting.
 */
export function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const source = code.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="surface-strong overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 text-xs text-[var(--text-tertiary)]">
        <span className="rounded-md border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-2 py-1 text-[var(--accent)]">{language}</span>
        <button className="inline-flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]" onClick={handleCopy} type="button">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <Highlight code={source} language={language as never} theme={themes.vsDark}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} overflow-x-auto p-5 text-sm`} style={{ ...style, background: '#10131a' }}>
            {tokens.map((line, index) => {
              const lineProps = getLineProps({ line });
              return (
                <div {...lineProps} className={`grid grid-cols-[40px_1fr] gap-4 ${lineProps.className ?? ''}`} key={index}>
                  <span className="select-none text-right text-[var(--text-tertiary)]">{index + 1}</span>
                  <span>
                    {line.map((token, tokenIndex) => (
                      <span key={tokenIndex} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
