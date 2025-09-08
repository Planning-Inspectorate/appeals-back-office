import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteArea = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'site-area',
		text: 'What is the area of the appeal site?',
		value: appellantCaseData.siteAreaSquareMetres
			? `${appellantCaseData.siteAreaSquareMetres} m²`
			: 'No data',
		link: `${currentRoute}/site-area/change`,
		editable: userHasUpdateCase,
		classes: 'appeal-site-area'
	});
