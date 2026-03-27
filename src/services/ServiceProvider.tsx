// ================================================================
// FILE: src/services/ServiceProvider.tsx
// PURPOSE: DI container. Creates all services and exposes them to the app.
// DEPENDENCIES: src/services/interfaces, src/services/impl/*
// ================================================================

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type {
  IExportService,
  IScoringService,
  IStorageService,
  ITimerService,
  IYamlParserService,
} from './interfaces';
import { ClientExportService } from './impl/ClientExportService';
import { DexieStorageService } from './impl/DexieStorageService';
import { IntervalTimerService } from './impl/IntervalTimerService';
import { ScoringService } from './impl/ScoringService';
import { YamlParserService } from './impl/YamlParserService';

export interface ServiceContainer {
  yamlParser: IYamlParserService;
  scoring: IScoringService;
  storage: IStorageService;
  timer: ITimerService;
  export: IExportService;
}

const ServiceContext = createContext<ServiceContainer | null>(null);
let activeContainer: ServiceContainer | null = null;

/**
 * Read the active service container outside React components.
 *
 * @returns Current service container.
 */
export function getServiceContainer(): ServiceContainer {
  if (!activeContainer) {
    throw new Error('Services are not initialized yet.');
  }
  return activeContainer;
}

/**
 * Mount the DI container near the app root.
 *
 * @param children - App subtree.
 * @param overrides - Optional mock implementations for tests.
 * @returns Context provider.
 */
export function ServiceProvider({
  children,
  overrides = {},
}: {
  children: ReactNode;
  overrides?: Partial<ServiceContainer>;
}) {
  const container = useMemo<ServiceContainer>(() => ({
    yamlParser: overrides.yamlParser ?? new YamlParserService(),
    scoring: overrides.scoring ?? new ScoringService(),
    storage: overrides.storage ?? new DexieStorageService(),
    timer: overrides.timer ?? new IntervalTimerService(),
    export: overrides.export ?? new ClientExportService(),
  }), [overrides.export, overrides.scoring, overrides.storage, overrides.timer, overrides.yamlParser]);

  activeContainer = container;

  return <ServiceContext.Provider value={container}>{children}</ServiceContext.Provider>;
}

/**
 * Access the current service container from React components.
 *
 * @returns Shared service instances.
 */
export function useService(): ServiceContainer {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService() must be used within <ServiceProvider>.');
  }
  return context;
}
