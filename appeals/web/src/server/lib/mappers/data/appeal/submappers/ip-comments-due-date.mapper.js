import { isStatePassed } from '#lib/appeal-status.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapIpCommentsDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'ip-comments-due-date';

	const useNewTimetableRoute = [
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.S78,
		APPEAL_TYPE.PLANNED_LISTED_BUILDING
	].includes(appealDetails.appealType || '');

	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}

	return textSummaryListItem({
		id,
		text: 'Interested party comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.ipCommentsDueDate),
		link: useNewTimetableRoute
			? `${currentRoute}/timetable/edit`
			: `${currentRoute}/appeal-timetables/ip-comments`,
		editable:
			!isChildAppeal(appealDetails) &&
			(useNewTimetableRoute
				? !isStatePassed(appealDetails, APPEAL_CASE_STATUS.STATEMENTS)
				: !appealDetails.documentationSummary.ipComments?.counts?.published) &&
			userHasUpdateCasePermission &&
			Boolean(appealDetails.startedAt),
		classes: 'appeal-ip-comments-due-date'
	});
};
