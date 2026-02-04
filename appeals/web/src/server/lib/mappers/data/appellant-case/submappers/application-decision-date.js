import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationDecisionDate = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'application-decision-date',
		text:
			appellantCaseData.applicationDecision === 'not_received'
				? 'What date was your decision due from the local planning authority?'
				: 'What’s the date on the decision letter from the local planning authority?​',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDecisionDate, 'No data'),
		link: `${currentRoute}/application-decision-date/change`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild
	});
