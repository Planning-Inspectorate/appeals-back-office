import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEiaScreening = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'eia-screening',
		text: 'Did you submit an environmental statement with the application?',
		value: appellantCaseData.screeningOpinionIndicatesEiaRequired,
		link: `${currentRoute}/eia-screening/change`,
		editable: userHasUpdateCase
	});
