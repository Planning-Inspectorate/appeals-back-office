import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapHorizonReference = ({ appealDetails, currentRoute }) => {
	return textSummaryListItem({
		id: 'horizon-reference',
		text: 'Horizon reference',
		value: appealDetails.transferStatus?.transferredAppealReference,
		link: `${currentRoute}/change-appeal-type/add-horizon-reference`,
		editable: true,
		classes: 'appeal-horizon-type'
	});
};
