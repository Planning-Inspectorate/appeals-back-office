import { booleanWithDetailsSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapInspectorAccess = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'inspector-access',
		text: 'Will an inspector need to access your land or property?',
		value: appellantCaseData.siteAccessRequired?.isRequired,
		valueDetails: appellantCaseData.siteAccessRequired?.details,
		defaultText: 'No',
		link: `${currentRoute}/inspector-access/change/appellant`,
		editable: userHasUpdateCase,
		classes: 'appellantcase-inspector-access',
		addCyAttribute: true,
		withShowMore: true,
		showMoreLabelText: 'Enter reason'
	});
