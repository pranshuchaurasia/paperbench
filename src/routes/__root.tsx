// ================================================================
// FILE: src/routes/__root.tsx
// PURPOSE: Root layout with providers, navigation, and animated outlet.
// DEPENDENCIES: tanstack router, framer-motion, src/components/layout/*
// ================================================================

import { AnimatePresence } from 'framer-motion';
import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { NavBar } from '../components/layout/NavBar';
import { PageTransition } from '../components/layout/PageTransition';
import { useTheme } from '../hooks/useTheme';
import { ServiceProvider, useService } from '../services/ServiceProvider';
import { useExamStore } from '../store/examStore';

function RootFrame() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const hydrateSession = useExamStore((state) => state.hydrateSession);
  const status = useExamStore((state) => state.status);
  const examConfig = useExamStore((state) => state.examConfig);
  const { storage } = useService();
  const { theme, setTheme } = useTheme(examConfig?.settings.theme ?? 'system');

  useEffect(() => {
    if (status !== 'idle') {
      return;
    }
    storage.loadExamSession().then((session) => {
      if (session) {
        hydrateSession(session);
      }
    }).catch(() => undefined);
  }, [hydrateSession, status, storage]);

  return (
    <div className="min-h-screen pb-10">
      {pathname !== '/exam/live' ? (
        <NavBar
          onThemeChange={setTheme}
          theme={theme}
        />
      ) : null}
      <main className="mx-auto flex w-full max-w-[1400px] px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <PageTransition key={pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: () => (
    <ServiceProvider>
      <RootFrame />
    </ServiceProvider>
  ),
});
