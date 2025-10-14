import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute, dateISOStringToDisplayDate } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';
import { capitalize } from 'lodash-es';
import { dueDateFieledName } from './appeal-timetable.constants.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @typedef {Object} AppealTimetablesMap
 * @property {string | null | undefined} sideNote
 * @property { object } page
 */

/**
 * @typedef {'lpaQuestionnaireDueDate' | 'ipCommentsDueDate' | 'appellantStatementDueDate' | 'lpaStatementDueDate' | 'finalCommentsDueDate' | 's106ObligationDueDate' } AppealTimetableType
 */

/**
 * @type {Object.<'lpa-questionnaire' | 'ip-comments' | 'appellant-statement' | 'lpa-statement' | 'final-comments' | 'lpa-final-comments' | 's106-obligation' , 'lpaQuestionnaireDueDate' | 'ipCommentsDueDate' | 'appellantStatementDueDate' | 'lpaStatementDueDate' | 'finalCommentsDueDate' | 's106ObligationDueDate'>}
 */
export const routeToObjectMapper = {
	'lpa-questionnaire': 'lpaQuestionnaireDueDate',
	'ip-comments': 'ipCommentsDueDate',
	'appellant-statement': 'appellantStatementDueDate',
	'lpa-statement': 'lpaStatementDueDate',
	'final-comments': 'finalCommentsDueDate',
	's106-obligation': 's106ObligationDueDate'
};

/**
 * @param {import('./appeal-timetables.service.js').AppealTimetables} appealTimetables
 * @param {AppealTimetableType} timetableType
 * @param {Appeal} appealDetails
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const mapUpdateDueDatePage = (appealTimetables, timetableType, appealDetails, errors) => {
	const currentDueDateIso = appealTimetables && appealTimetables[timetableType];
	const currentDueDate = currentDueDateIso && dateISOStringToDisplayDate(currentDueDateIso);
	const currentDueDateDayMonthYear =
		currentDueDateIso && dateISOStringToDayMonthYearHourMinute(currentDueDateIso);
	const changeOrScheduleText = currentDueDate ? 'Change' : 'Schedule';
	const timetableTypeText = getTimetableTypeText(timetableType);

	/** @type {PageContent} */
	const pageContent = {
		title: `Update${timetableTypeText ? ' ' + capitalize(timetableTypeText) : ''} due date`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		heading: `${changeOrScheduleText} ${timetableTypeText} due date`,
		submitButtonProperties: {
			text: 'Confirm',
			type: 'submit'
		},
		pageComponents: [
			dateInput({
				name: dueDateFieledName,
				id: dueDateFieledName,
				namePrefix: dueDateFieledName,
				value: currentDueDateDayMonthYear
					? {
							day: currentDueDateDayMonthYear?.day,
							month: currentDueDateDayMonthYear?.month,
							year: currentDueDateDayMonthYear?.year
					  }
					: {},
				legendText: ``,
				hint: 'For example, 27 3 2007',
				errors: errors
			})
		]
	};

	if (currentDueDate) {
		pageContent.pageComponents?.push({
			type: 'inset-text',
			parameters: {
				text: `The current due date for the ${timetableTypeText} is ${currentDueDate}`,
				classes: 'govuk-!-margin-bottom-7'
			}
		});
	}

	return pageContent;
};

/**
 * @param { number } updatedDueDateDay
 * @param { string } apiError
 * @returns {import("@pins/express").ValidationErrors | undefined}
 */
export const apiErrorMapper = (updatedDueDateDay, apiError) => ({
	'due-date-day': {
		value: String(updatedDueDateDay),
		msg: `Date ${apiError}`,
		type: 'field',
		path: '',
		location: 'body'
	}
});

/**
 * @param {AppealTimetableType} timetableType
 * @returns {string}
 */
const getTimetableTypeText = (timetableType) => {
	switch (timetableType) {
		case 'lpaQuestionnaireDueDate':
			return 'LPA questionnaire';
		case 'ipCommentsDueDate':
			return 'interested-party comments';
		case 'appellantStatementDueDate':
			return 'appellant statement';
		case 'lpaStatementDueDate':
			return 'LPA statement';
		case 'finalCommentsDueDate':
			return 'final comments';
		case 's106ObligationDueDate':
			return 'S106 obligation';
		default:
			return '';
	}
};
