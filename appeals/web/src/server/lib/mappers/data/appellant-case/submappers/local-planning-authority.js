import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { isLpaqReceived } from '#lib/mappers/utils/is-lpaq-received.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLocalPlanningAuthority = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase,
	appealDetails
}) =>
	textSummaryListItem({
		id: 'local-planning-authority',
		text:
			appealDetails.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE
				? 'Local planning authority'
				: 'Which local planning authority (LPA) do you want to appeal against?',
		value: appellantCaseData.localPlanningDepartment,
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		editable: userHasUpdateCase && !isLpaqReceived(appealDetails)
	});
