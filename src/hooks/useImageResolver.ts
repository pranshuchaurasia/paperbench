// ================================================================
// FILE: src/hooks/useImageResolver.ts
// PURPOSE: Resolve question images into renderable URLs.
// DEPENDENCIES: react, src/utils/imageLoader
// ================================================================

import { useEffect, useState } from 'react';
import { resolveImageSource, type ResolvedImage } from '../utils/imageLoader';

/**
 * Resolve a question image source with asynchronous caching support.
 *
 * @param source - Raw YAML image source.
 * @param imageMap - Uploaded image lookup map.
 * @returns Resolved image descriptor.
 */
export function useImageResolver(source: string | undefined, imageMap: Record<string, string>) {
  const [resolved, setResolved] = useState<ResolvedImage>({ src: null, offlineFallback: false });

  useEffect(() => {
    let cancelled = false;

    if (!source) {
      setResolved({ src: null, offlineFallback: false });
      return () => {
        cancelled = true;
      };
    }

    resolveImageSource(source, imageMap)
      .then((nextValue) => {
        if (!cancelled) {
          setResolved(nextValue);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResolved({ src: null, offlineFallback: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imageMap, source]);

  return resolved;
}
