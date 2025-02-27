import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapApplicationDate = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'application-date',
		text: 'Application submitted',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDate),
		link: `${currentRoute}/application-date/change`,
		editable: userHasUpdateCase
	});
