// ================================================================
// FILE: src/services/impl/DexieStorageService.ts
// PURPOSE: IndexedDB-backed persistence for sessions, history, and preferences.
// DEPENDENCIES: dexie, src/types
// ================================================================

import Dexie, { type Table } from 'dexie';
import type { ExamHistoryEntry, ExamSession, ImageCacheRecord, PreferenceRecord, ThemePreference } from '../../types';
import type { IStorageService } from '../interfaces';

export class PaperBenchDatabase extends Dexie {
  examSessions!: Table<ExamSession, string>;
  examHistory!: Table<ExamHistoryEntry, string>;
  preferences!: Table<PreferenceRecord, string>;
  imageCache!: Table<ImageCacheRecord, string>;

  constructor() {
    super('paperbench');
    this.version(1).stores({
      examSessions: '&id',
      examHistory: '&id, takenAt',
      preferences: '&key',
      imageCache: '&url, cachedAt',
    });
  }
}

export const database = new PaperBenchDatabase();

/**
 * DexieStorageService persists exam data in IndexedDB.
 */
export class DexieStorageService implements IStorageService {
  async saveExamSession(session: ExamSession): Promise<void> {
    await database.examSessions.put(session);
  }

  async loadExamSession(): Promise<ExamSession | null> {
    return (await database.examSessions.toCollection().first()) ?? null;
  }

  async clearExamSession(): Promise<void> {
    await database.examSessions.clear();
  }

  async saveToHistory(result: ExamHistoryEntry): Promise<void> {
    await database.examHistory.put(result);
  }

  async loadHistory(): Promise<ExamHistoryEntry[]> {
    return database.examHistory.orderBy('takenAt').reverse().toArray();
  }

  async loadFullHistory(): Promise<ExamHistoryEntry[]> {
    return database.examHistory.orderBy('takenAt').reverse().toArray();
  }

  async deleteHistoryEntry(id: string): Promise<void> {
    await database.examHistory.delete(id);
  }

  async saveThemePreference(theme: ThemePreference): Promise<void> {
    await database.preferences.put({ key: 'theme', value: theme });
  }

  async loadThemePreference(): Promise<ThemePreference | null> {
    return (await database.preferences.get('theme'))?.value ?? null;
  }
}

