import { booleanWithDetailsSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapInspectorAccess = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'inspector-access',
		text: 'Inspector access required',
		value: appellantCaseData.siteAccessRequired?.isRequired,
		valueDetails: appellantCaseData.siteAccessRequired?.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/inspector-access/change/appellant`,
		editable: userHasUpdateCase,
		classes: 'appellantcase-inspector-access',
		addCyAttribute: true,
		withShowMore: true,
		showMoreLabelText: 'Inspector access details'
	});
