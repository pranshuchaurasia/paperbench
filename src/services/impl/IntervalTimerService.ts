// ================================================================
// FILE: src/services/impl/IntervalTimerService.ts
// PURPOSE: Countdown timer with pause/resume support and drift correction.
// DEPENDENCIES: src/services/interfaces
// ================================================================

import type { ITimerService } from '../interfaces';

/**
 * IntervalTimerService uses timestamps to avoid cumulative interval drift.
 */
export class IntervalTimerService implements ITimerService {
  private durationSeconds = 0;
  private startedAt = 0;
  private pausedRemaining = 0;
  private intervalId: number | null = null;
  private onTick: ((remaining: number) => void) | null = null;
  private onExpire: (() => void) | null = null;

  start(durationSeconds: number, onTick: (remaining: number) => void, onExpire: () => void): void {
    this.stop();
    this.durationSeconds = durationSeconds;
    this.startedAt = Date.now();
    this.pausedRemaining = durationSeconds;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.intervalId = window.setInterval(() => this.emit(), 250);
    this.emit();
  }

  pause(): void {
    this.pausedRemaining = this.getRemaining();
    if (this.intervalId != null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume(): void {
    this.startedAt = Date.now() - ((this.durationSeconds - this.pausedRemaining) * 1000);
    if (this.intervalId == null && this.onTick && this.onExpire) {
      this.intervalId = window.setInterval(() => this.emit(), 250);
      this.emit();
    }
  }

  stop(): void {
    if (this.intervalId != null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getRemaining(): number {
    const elapsed = Math.floor((Date.now() - this.startedAt) / 1000);
    return Math.max(0, this.durationSeconds - elapsed);
  }

  private emit() {
    const remaining = this.getRemaining();
    this.pausedRemaining = remaining;
    this.onTick?.(remaining);
    if (remaining <= 0) {
      this.stop();
      this.onExpire?.();
    }
  }
}
