import type { LeadIngestionIdempotencyStore } from './types';

export type RedisLikeClient = {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    mode: 'EX',
    ttlSeconds: number,
    condition?: 'NX',
  ): Promise<'OK' | null>;
  del(key: string): Promise<number>;
  eval?(
    script: string,
    numberOfKeys: number,
    ...args: Array<string | number>
  ): Promise<unknown>;
};

export type RedisLeadIngestionIdempotencyOptions = {
  keyPrefix?: string;
  claimTtlSeconds?: number;
  completedTtlSeconds?: number;
};

const RELEASE_IF_PENDING_LUA = `
local value = redis.call('GET', KEYS[1])
if value == 'pending' then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

export class RedisLeadIngestionIdempotencyStore
  implements LeadIngestionIdempotencyStore
{
  private readonly keyPrefix: string;
  private readonly claimTtlSeconds: number;
  private readonly completedTtlSeconds: number;

  constructor(
    private readonly redis: RedisLikeClient,
    options: RedisLeadIngestionIdempotencyOptions = {},
  ) {
    this.keyPrefix = options.keyPrefix ?? 'vylino:lead-ingestion:';
    this.claimTtlSeconds = options.claimTtlSeconds ?? 15 * 60;
    this.completedTtlSeconds = options.completedTtlSeconds ?? 7 * 24 * 60 * 60;
  }

  private toRedisKey(key: string) {
    return `${this.keyPrefix}${key}`;
  }

  async has(key: string): Promise<boolean> {
    return (await this.redis.get(this.toRedisKey(key))) !== null;
  }

  async claim(key: string, ttlSeconds = this.claimTtlSeconds): Promise<boolean> {
    const result = await this.redis.set(
      this.toRedisKey(key),
      'pending',
      'EX',
      ttlSeconds,
      'NX',
    );

    return result === 'OK';
  }

  async complete(key: string): Promise<void> {
    await this.redis.set(
      this.toRedisKey(key),
      'completed',
      'EX',
      this.completedTtlSeconds,
    );
  }

  async release(key: string): Promise<void> {
    const redisKey = this.toRedisKey(key);

    if (this.redis.eval) {
      await this.redis.eval(RELEASE_IF_PENDING_LUA, 1, redisKey);
      return;
    }

    const value = await this.redis.get(redisKey);
    if (value === 'pending') {
      await this.redis.del(redisKey);
    }
  }
}
