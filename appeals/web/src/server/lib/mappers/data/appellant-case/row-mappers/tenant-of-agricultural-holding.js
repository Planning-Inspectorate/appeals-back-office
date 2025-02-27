import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapTenantOfAgriculturalHolding = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'tenant-of-agricultural-holding',
		text: 'Tenant of agricultural holding',
		value: appellantCaseData.agriculturalHolding?.isTenant,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/tenant/change`,
		editable: userHasUpdateCase
	});
