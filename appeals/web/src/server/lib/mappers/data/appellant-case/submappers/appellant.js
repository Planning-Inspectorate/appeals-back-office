import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellant = ({
	appealDetails,
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	return textSummaryListItem({
		id: 'appellant',
		text: 'Appellant’s contact details',
		value: {
			html: appealDetails.appellant
				? formatServiceUserAsHtmlList(appealDetails.appellant)
				: 'No data'
		},
		link: `${currentRoute}/service-user/change/appellant`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		classes: 'appeal-appellant',
		cypressDataName: 'appellant'
	});
};
