import type { LeadIngestionIdempotencyStore } from './types';

type Entry = {
  expiresAt?: number;
  completed: boolean;
};

export class InMemoryLeadIngestionIdempotencyStore
  implements LeadIngestionIdempotencyStore
{
  private readonly entries = new Map<string, Entry>();

  private pruneExpired(key: string) {
    const entry = this.entries.get(key);
    if (!entry?.expiresAt) return;

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
    }
  }

  async has(key: string): Promise<boolean> {
    this.pruneExpired(key);
    return this.entries.has(key);
  }

  async claim(key: string, ttlSeconds = 60 * 60 * 24): Promise<boolean> {
    this.pruneExpired(key);

    if (this.entries.has(key)) return false;

    this.entries.set(key, {
      completed: false,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    return true;
  }

  async complete(key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;

    this.entries.set(key, { ...entry, completed: true });
  }

  async release(key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry?.completed) this.entries.delete(key);
  }
}
