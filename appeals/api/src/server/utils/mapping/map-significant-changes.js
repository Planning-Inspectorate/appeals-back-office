export const SIGNIFICANT_CHANGE_VALUE_MAP = {
	'Local plan': 'adopted-a-new-local-plan',
	'National policy': 'national-policy-change',
	'Court judgment': 'court-judgement',
	Other: 'other'
};

/**
 *
 * @param {{value: string, comment: string}[]|undefined} changes
 * @param {keyof SIGNIFICANT_CHANGE_VALUE_MAP} type
 * @returns {string|null}
 */
export const extractSignificantChangeValue = (changes, type) => {
	const mappedValue = SIGNIFICANT_CHANGE_VALUE_MAP[type];
	const change = changes?.find((c) => c.value === mappedValue);
	return change?.comment ?? null;
};
