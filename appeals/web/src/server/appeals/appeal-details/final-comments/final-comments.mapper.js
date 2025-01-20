/**
 * @param {string} finalCommentsType
 * @param {boolean} [capitaliseFirstLetter]
 * @returns {string}
 */
export function formatFinalCommentsTypeText(finalCommentsType, capitaliseFirstLetter = false) {
	return finalCommentsType === 'lpa' ? 'LPA' : `${capitaliseFirstLetter ? 'A' : 'a'}ppellant`;
}
