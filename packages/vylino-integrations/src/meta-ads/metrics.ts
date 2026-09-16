type MetaAction = {
  action_type: string;
  value: string;
};

export const getMetaActionValue = (
  actions: MetaAction[] | undefined,
  actionTypes: string[],
): number => {
  if (!actions) return 0;

  return actions
    .filter((action) => actionTypes.includes(action.action_type))
    .reduce((total, action) => total + Number(action.value || 0), 0);
};

export const normalizeMetaConversions = (actions?: MetaAction[]) => ({
  leads: getMetaActionValue(actions, [
    'lead',
    'onsite_conversion.lead_grouped',
  ]),
  purchases: getMetaActionValue(actions, [
    'purchase',
    'omni_purchase',
  ]),
  conversions: getMetaActionValue(actions, [
    'lead',
    'onsite_conversion.lead_grouped',
    'purchase',
    'omni_purchase',
  ]),
});
