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
		text: 'What’s the date on the decision letter from the local planning authority?​',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDecisionDate, 'No data'),
		link: `${currentRoute}/application-decision-date/change`,
		editable: userHasUpdateCase
	});
