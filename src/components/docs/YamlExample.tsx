// ================================================================
// FILE: src/components/docs/YamlExample.tsx
// PURPOSE: Syntax-highlighted YAML example block for docs.
// DEPENDENCIES: react, src/components/exam/CodeBlock
// ================================================================

import { CodeBlock } from '../exam/CodeBlock';

export function YamlExample({ code }: { code: string }) {
  return <CodeBlock code={code} language="yaml" />;
}
