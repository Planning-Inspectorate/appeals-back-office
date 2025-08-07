import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseProcedure = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	if (!appealDetails.appealTimetable) {
		return { id: 'case-procedure', display: {} };
	}

	return textSummaryListItem({
		id: 'case-procedure',
		text: 'Appeal procedure',
		value: appealDetails.procedureType || 'No data',
		link: `${currentRoute}/change-appeal-details/case-procedure`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-case-procedure'
	});
};
