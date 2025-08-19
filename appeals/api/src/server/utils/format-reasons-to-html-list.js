/**
 * @param {string[]} reasons - List of reasons to format into HTML list
 * @returns {string} Formatted HTML list
 */
export const formatReasonsToHtmlList = (reasons) => {
	const listItems = reasons.map((reason) => `<li>${reason}</li>`).join('');
	return `<ul>${listItems}</ul>`;
};
