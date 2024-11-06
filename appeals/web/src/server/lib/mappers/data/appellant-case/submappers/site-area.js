import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteArea = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'site-area',
		text: 'Site area (m²)',
		value: appellantCaseData.siteAreaSquareMetres
			? `${appellantCaseData.siteAreaSquareMetres} m²`
			: '',
		link: `${currentRoute}/site-area/change`,
		editable: userHasUpdateCase
	});
