import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCaseProcedure = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'case-procedure',
		text: 'Case procedure',
		value: appealDetails.procedureType || `No case procedure`,
		link: `${currentRoute}/change-appeal-details/case-procedure`,
		userHasEditPermission: userHasUpdateCasePermission,
		classes: 'appeal-case-procedure'
	});
