/**
 * @param {string} finalCommentsType
 * @returns {string}
 */
export function formatFinalCommentsTypeText(finalCommentsType) {
	return finalCommentsType === 'lpa' ? 'LPA' : 'appellant';
}
