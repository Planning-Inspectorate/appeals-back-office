import { textSummaryListItem } from '#lib/mappers/index.js';
import isLinkedAppeal from '#lib/mappers/utils/is-linked-appeal.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCaseProcedure = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	if (!appealDetails.appealTimetable) {
		return { id: 'case-procedure', display: {} };
	}

	return textSummaryListItem({
		id: 'case-procedure',
		text: 'Appeal procedure',
		value: appealDetails.procedureType || 'No data',
		link: `${currentRoute}/change-appeal-procedure-type/change-selected-procedure-type`,
		editable:
			userHasUpdateCasePermission &&
			!isLinkedAppeal(appealDetails) &&
			appealDetails.appealType !== APPEAL_TYPE.ENFORCEMENT_NOTICE,
		classes: 'appeal-case-procedure'
	});
};
