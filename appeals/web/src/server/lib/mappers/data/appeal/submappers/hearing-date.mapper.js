import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapHearingDate = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	const id = 'timetable-hearing-date';

	if (
		!appealDetails.startedAt ||
		appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.HEARING
	) {
		return { id, display: {} };
	}

	const hearing = appealDetails.hearing;

	const value = hearing?.hearingStartTime
		? `${dateISOStringToDisplayTime12hr(hearing.hearingStartTime)} on ${dateISOStringToDisplayDate(
				hearing.hearingStartTime
			)}`
		: 'Not set up';

	return textSummaryListItem({
		id,
		text: 'Hearing date',
		value,
		link: hearing ? `${currentRoute}/hearing/change/date` : `${currentRoute}/hearing/setup`,
		actionText: hearing ? 'Change' : 'Set up',
		editable:
			!isChildAppeal(appealDetails) &&
			userHasUpdateCasePermission &&
			Boolean(appealDetails.startedAt),
		classes: 'appeal-hearing-date'
	});
};
