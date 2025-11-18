import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementReference = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'enforcement-reference',
		text: 'What is the reference number on the enforcement notice?',
		value: appellantCaseData.enforcementNotice?.reference || 'No data',
		link: `${currentRoute}/enforcement-reference/change`,
		editable: userHasUpdateCase
	});
