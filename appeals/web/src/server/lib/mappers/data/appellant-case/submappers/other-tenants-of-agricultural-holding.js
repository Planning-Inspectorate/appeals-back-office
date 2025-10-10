import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapOtherTenantsOfAgriculturalHolding = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'other-tenants-of-agricultural-holding',
		text: 'Are there any other tenants?',
		value: appellantCaseData.agriculturalHolding?.hasOtherTenants,
		defaultText: 'Not answered',
		link: `${currentRoute}/agricultural-holding/other-tenants/change`,
		editable: userHasUpdateCase
	});
