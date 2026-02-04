import { textSummaryListItem } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementReference = ({
	appellantCase,
	currentRoute,
	request,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'enforcement-reference',
		text: 'Enforcement notice reference',
		value: appellantCase?.enforcementNotice?.reference || 'Not provided',
		link: addBackLinkQueryToUrl(
			request,
			`${currentRoute}/appellant-case/enforcement-reference/change`
		),
		editable: userHasUpdateCasePermission,
		classes: 'appeal-enforcement-reference'
	});
