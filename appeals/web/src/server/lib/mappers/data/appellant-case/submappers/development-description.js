import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapDevelopmentDescription = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'development-description',
		text: 'Enter the description of development that you submitted in your application',
		value: appellantCaseData.developmentDescription?.details || 'No data',
		link: `${currentRoute}/development-description/change`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		withShowMore: true,
		showMoreLabelText:
			'Enter the description of development that you submitted in your application',
		classes: 'appeal-development-description'
	});
