import {
  RedisLeadIngestionIdempotencyStore,
  type RedisLeadIngestionIdempotencyOptions,
  type RedisLikeClient,
} from '../lead-ingestion/redis-idempotency-store';

export type TwentyRedisClientServiceLike = {
  getClient(): RedisLikeClient;
};

export const createTwentyRedisLeadIngestionStore = (
  redisClientService: TwentyRedisClientServiceLike,
  options?: RedisLeadIngestionIdempotencyOptions,
) =>
  new RedisLeadIngestionIdempotencyStore(
    redisClientService.getClient(),
    options,
  );
