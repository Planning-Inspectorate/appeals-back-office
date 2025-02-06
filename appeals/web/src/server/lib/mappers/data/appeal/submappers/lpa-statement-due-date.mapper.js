import { APPEAL_REPRESENTATION_STATUS } from 'pins-data-model';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatementDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'lpa-statement-due-date',
		text: 'LPA statement due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaStatementDueDate),
		link: `${currentRoute}/appeal-timetables/lpa-statement`,
		editable:
			userHasUpdateCasePermission &&
			Boolean(appealDetails.validAt) &&
			appealDetails.documentationSummary?.lpaStatement?.representationStatus !==
				APPEAL_REPRESENTATION_STATUS.PUBLISHED,
		classes: 'appeal-lpa-statement-due-date'
	});
