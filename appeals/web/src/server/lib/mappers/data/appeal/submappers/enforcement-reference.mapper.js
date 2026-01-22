import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementReference = ({
	appellantCase,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'enforcement-reference',
		text: 'Enforcement notice reference',
		value: appellantCase?.enforcementNotice?.reference || 'Not provided',
		link: `${currentRoute}/enforcement-reference/change`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-enforcement-reference'
	});
