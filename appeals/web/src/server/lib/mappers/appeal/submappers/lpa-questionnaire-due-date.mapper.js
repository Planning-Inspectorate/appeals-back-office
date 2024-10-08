import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaQuestionnaireDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'lpa-questionnaire-due-date',
		text: 'LPA questionnaire due',
		value:
			dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaQuestionnaireDueDate) ||
			'Due date not yet set',
		link: `${currentRoute}/appeal-timetables/lpa-questionnaire`,
		userHasEditPermission: userHasUpdateCasePermission,
		classes: 'appeal-lpa-questionnaire-due-date'
	});
