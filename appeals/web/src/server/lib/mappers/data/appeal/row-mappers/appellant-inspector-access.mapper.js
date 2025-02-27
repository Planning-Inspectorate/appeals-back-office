import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapAppellantInspectorAccess = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'appellant-case-inspector-access',
		text: 'Inspection access (appellant answer)',
		value: appealDetails.inspectorAccess.appellantCase.isRequired,
		valueDetails: appealDetails.inspectorAccess.appellantCase.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/inspector-access/change/appellant`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-appellant-inspector-access',
		withShowMore: true,
		showMoreLabelText: 'Inspection access details (appellant answer)'
	});
