import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationDate = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'application-date',
		text: 'What date did you submit your application?',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDate),
		link: `${currentRoute}/application-date/change`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild
	});
