import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantCostsApplication = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'appellant-costs-application',
		text: 'Applied for award of appeal costs',
		value: appellantCaseData.appellantCostsAppliedFor,
		link: `${currentRoute}/appeal-costs-application/change`,
		editable: userHasUpdateCase
	});
