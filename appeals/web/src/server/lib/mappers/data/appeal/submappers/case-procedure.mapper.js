import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseProcedure = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'case-procedure',
		text: 'Case procedure',
		value: appealDetails.procedureType || `No case procedure`,
		link: `${currentRoute}/change-appeal-details/case-procedure`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-case-procedure'
	});
