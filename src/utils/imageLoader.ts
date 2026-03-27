// ================================================================
// FILE: src/utils/imageLoader.ts
// PURPOSE: Resolve image sources for relative files, data URIs, and URLs.
// DEPENDENCIES: src/services/impl/DexieStorageService
// ================================================================

import { database } from '../services/impl/DexieStorageService';

export interface ResolvedImage {
  src: string | null;
  offlineFallback: boolean;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Could not convert blob to data URL.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read blob.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Resolve an image source using uploaded files first, then cached or remote URLs.
 *
 * @param source - Image source from YAML.
 * @param imageMap - Relative path to object URL map.
 * @returns Renderable image source or fallback metadata.
 */
export async function resolveImageSource(
  source: string,
  imageMap: Record<string, string>,
): Promise<ResolvedImage> {
  if (source.startsWith('data:')) {
    return { src: source, offlineFallback: false };
  }

  if (/^https?:\/\//i.test(source)) {
    const cached = await database.imageCache.get(source);

    if (navigator.onLine) {
      try {
        const response = await fetch(source);
        if (response.ok) {
          const dataUrl = await blobToDataUrl(await response.blob());
          await database.imageCache.put({ url: source, dataUrl, cachedAt: new Date().toISOString() });
          return { src: dataUrl, offlineFallback: false };
        }
      } catch {
        if (cached) {
          return { src: cached.dataUrl, offlineFallback: false };
        }
      }
    }

    if (cached) {
      return { src: cached.dataUrl, offlineFallback: false };
    }

    return { src: null, offlineFallback: true };
  }

  const direct = imageMap[source] ?? imageMap[source.replace(/^\.?\//, '')];
  if (direct) {
    return { src: direct, offlineFallback: false };
  }

  return { src: null, offlineFallback: true };
}
