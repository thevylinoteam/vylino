type RedisLikeClient = {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    mode: 'EX',
    ttlSeconds: number,
    condition?: 'NX',
  ): Promise<string | null>;
  del(key: string): Promise<number>;
  eval(
    script: string,
    numberOfKeys: number,
    ...args: Array<string | number>
  ): Promise<unknown>;
};

const RELEASE_IF_PENDING_LUA = `
local value = redis.call('GET', KEYS[1])
if value == 'pending' then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

export class VylinoLeadIdempotencyStore {
  private readonly prefix = 'vylino:lead-ingestion:';
  private readonly claimTtlSeconds = 15 * 60;
  private readonly completedTtlSeconds = 7 * 24 * 60 * 60;

  constructor(private readonly redis: RedisLikeClient) {}

  private key(idempotencyKey: string) {
    return `${this.prefix}${idempotencyKey}`;
  }

  async claim(idempotencyKey: string): Promise<boolean> {
    const result = await this.redis.set(
      this.key(idempotencyKey),
      'pending',
      'EX',
      this.claimTtlSeconds,
      'NX',
    );

    return result === 'OK';
  }

  async complete(idempotencyKey: string): Promise<void> {
    await this.redis.set(
      this.key(idempotencyKey),
      'completed',
      'EX',
      this.completedTtlSeconds,
    );
  }

  async release(idempotencyKey: string): Promise<void> {
    await this.redis.eval(RELEASE_IF_PENDING_LUA, 1, this.key(idempotencyKey));
  }
}
