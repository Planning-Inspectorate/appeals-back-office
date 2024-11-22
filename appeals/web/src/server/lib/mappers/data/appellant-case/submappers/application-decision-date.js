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
		text: 'Application decision date',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDecisionDate),
		link: `${currentRoute}/application-decision-date/change`,
		editable: userHasUpdateCase
	});
