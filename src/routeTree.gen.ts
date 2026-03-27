// ================================================================
// FILE: src/routeTree.gen.ts
// PURPOSE: Manual route tree assembly matching the file-based route layout.
// DEPENDENCIES: tanstack router, src/routes/*
// ================================================================

import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './routes/__root';
import { docsRoute } from './routes/docs';
import { historyRoute } from './routes/history';
import { indexRoute } from './routes/index';
import { metricsRoute } from './routes/metrics';
import { uploadRoute } from './routes/upload';
import { liveRoute } from './routes/exam/live';
import { resultsRoute } from './routes/exam/results';
import { reviewRoute } from './routes/exam/review';
import { setupRoute } from './routes/exam/setup';

export const routeTree = rootRoute.addChildren([
  indexRoute,
  uploadRoute,
  docsRoute,
  historyRoute,
  metricsRoute,
  setupRoute,
  liveRoute,
  resultsRoute,
  reviewRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
