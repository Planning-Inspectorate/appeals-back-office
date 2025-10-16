/**
 *
 * @param {string | null | undefined} appealType
 * @returns
 */
export const formatAppealTypeForNotify = (appealType) => {
	if (!appealType) {
		return '';
	}
	return appealType.charAt(0).toLowerCase() + appealType.slice(1) + ' appeal';
};
