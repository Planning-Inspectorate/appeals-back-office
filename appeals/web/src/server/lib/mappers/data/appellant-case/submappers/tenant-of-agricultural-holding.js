import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapTenantOfAgriculturalHolding = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'tenant-of-agricultural-holding',
		text: 'Are you a tenant of the agricultural holding?',
		value: appellantCaseData.agriculturalHolding?.isTenant,
		defaultText: 'Not answered',
		link: `${currentRoute}/agricultural-holding/tenant/change`,
		editable: userHasUpdateCase
	});
