export const getRetryDelayMs = (
  attempt: number,
  options: {
    baseDelayMs?: number;
    maxDelayMs?: number;
  } = {},
): number => {
  const baseDelayMs = options.baseDelayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 60000;
  const normalizedAttempt = Math.max(1, attempt);
  const exponential = baseDelayMs * 2 ** (normalizedAttempt - 1);

  return Math.min(exponential, maxDelayMs);
};

export const shouldRetryStatus = (status: number): boolean =>
  status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
