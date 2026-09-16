import type {
  AutomationDecision,
  IntentResult,
  WhatsAppAutomationMode,
} from './types';

export const isCustomerServiceWindowOpen = (
  lastInboundAt: string | undefined,
  now = new Date(),
): boolean => {
  if (!lastInboundAt) return false;
  const lastInbound = new Date(lastInboundAt).getTime();
  if (!Number.isFinite(lastInbound)) return false;
  return now.getTime() - lastInbound <= 24 * 60 * 60 * 1000;
};

export const decideWhatsAppAutomation = (input: {
  mode: WhatsAppAutomationMode;
  intent: IntentResult;
  lastInboundAt?: string;
  minimumConfidence?: number;
}): AutomationDecision => {
  if (input.intent.intent === 'OPT_OUT') {
    return {
      shouldReply: true,
      requiresHuman: false,
      optedOut: true,
      reason: 'OPT_OUT',
    };
  }

  if (input.mode === 'PAUSED' || input.mode === 'HUMAN') {
    return {
      shouldReply: false,
      requiresHuman: input.mode === 'HUMAN',
      optedOut: false,
      reason: 'AUTOMATION_DISABLED',
    };
  }

  if (input.intent.intent === 'HUMAN') {
    return {
      shouldReply: true,
      requiresHuman: true,
      optedOut: false,
      reason: 'HUMAN_REQUESTED',
    };
  }

  if (!isCustomerServiceWindowOpen(input.lastInboundAt)) {
    return {
      shouldReply: false,
      requiresHuman: false,
      optedOut: false,
      reason: 'OUTSIDE_SERVICE_WINDOW',
    };
  }

  const minimumConfidence = input.minimumConfidence ?? 0.55;
  if (input.intent.confidence < minimumConfidence) {
    return {
      shouldReply: input.mode === 'ASSISTED',
      requiresHuman: true,
      optedOut: false,
      reason: 'LOW_CONFIDENCE',
    };
  }

  return {
    shouldReply: true,
    requiresHuman: false,
    optedOut: false,
    reason: 'AUTO_REPLY',
  };
};
