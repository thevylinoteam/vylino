import type {
  VylinoAutomationEvent,
  VylinoAutomationEventName,
} from './types';

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`);

  return `{${entries.join(',')}}`;
};

const simpleHash = (value: string): string => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
};

export const createIdempotencyKey = (
  eventName: VylinoAutomationEventName,
  payload: unknown,
  correlationId?: string,
): string => {
  const fingerprint = stableStringify({ eventName, payload, correlationId });

  return `vylino:${eventName}:${simpleHash(fingerprint)}`;
};

export const createAutomationEvent = <TPayload>(input: {
  id: string;
  name: VylinoAutomationEventName;
  payload: TPayload;
  occurredAt?: string;
  workspaceId?: string;
  correlationId?: string;
  idempotencyKey?: string;
}): VylinoAutomationEvent<TPayload> => ({
  id: input.id,
  name: input.name,
  occurredAt: input.occurredAt ?? new Date().toISOString(),
  source: 'vylino',
  workspaceId: input.workspaceId,
  correlationId: input.correlationId,
  idempotencyKey:
    input.idempotencyKey ??
    createIdempotencyKey(input.name, input.payload, input.correlationId),
  payload: input.payload,
});
