import { textSummaryListItem } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementReference = ({
	appellantCaseData,
	currentRoute,
	request,
	userHasUpdateCase
}) => {
	const hasData = appellantCaseData.enforcementNotice?.reference !== null;
	return textSummaryListItem({
		id: 'enforcement-reference',
		text: 'What is the reference number on the enforcement notice?',
		value: appellantCaseData.enforcementNotice?.reference || 'No data',
		link: addBackLinkQueryToUrl(request, `${currentRoute}/enforcement-reference/change`),
		editable: hasData && userHasUpdateCase && !appellantCaseData.isEnforcementChild
	});
};
