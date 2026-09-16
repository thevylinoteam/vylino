export type MetaAction = {
  action_type: string;
  value: string;
};

export const getMetaActionValue = (
  actions: MetaAction[] | undefined,
  actionTypes: string[],
): number => {
  if (!actions) return 0;

  for (const actionType of actionTypes) {
    const action = actions.find((item) => item.action_type === actionType);

    if (action) {
      const value = Number(action.value || 0);
      return Number.isFinite(value) ? value : 0;
    }
  }

  return 0;
};

export const normalizeMetaConversions = (actions?: MetaAction[]) => {
  const leads = getMetaActionValue(actions, [
    'lead',
    'onsite_conversion.lead_grouped',
  ]);
  const purchases = getMetaActionValue(actions, [
    'purchase',
    'omni_purchase',
  ]);

  return {
    leads,
    purchases,
    conversions: leads + purchases,
  };
};
