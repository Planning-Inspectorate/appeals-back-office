import { dateToDisplayDate, apiDateStringToDayMonthYear } from '#lib/dates.js';
import { capitalize } from 'lodash-es';
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @typedef {Object} AppealTimetablesMap
 * @property {string | null | undefined} sideNote
 * @property { object } page
 */

/**
 * @typedef {'finalCommentReviewDate' | 'issueDeterminationDate' | 'lpaQuestionnaireDueDate' | 'statementReviewDate'} AppealTimetableType
 */

/**
 * @type {Object.<'final-comment-review' | 'issue-determination' | 'lpa-questionnaire' | 'statement-review', 'finalCommentReviewDate' | 'issueDeterminationDate' | 'lpaQuestionnaireDueDate' | 'statementReviewDate'>}
 */
export const routeToObjectMapper = {
	'final-comment-review': 'finalCommentReviewDate',
	'issue-determination': 'issueDeterminationDate',
	'lpa-questionnaire': 'lpaQuestionnaireDueDate',
	'statement-review': 'statementReviewDate'
};

/**
 * @param {import('./appeal-timetables.service.js').AppealTimetables} appealTimetables
 * @param {AppealTimetableType} timetableType
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 */
export const mapUpdateDueDatePage = (appealTimetables, timetableType, appealDetails) => {
	const currentDueDateIso = appealTimetables && appealTimetables[timetableType];
	const currentDueDate = currentDueDateIso && dateToDisplayDate(currentDueDateIso);
	const currentDueDateDayMonthYear =
		currentDueDateIso && apiDateStringToDayMonthYear(currentDueDateIso);
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
			{
				type: 'date-input',
				parameters: {
					id: 'due-date',
					namePrefix: 'due-date',
					hint: {
						text: 'For example, 27 3 2007'
					},
					...(currentDueDateDayMonthYear && {
						items: [
							{
								name: 'day',
								classes: 'govuk-input--width-2',
								value: currentDueDateDayMonthYear.day
							},
							{
								name: 'month',
								classes: 'govuk-input--width-2',
								value: currentDueDateDayMonthYear.month
							},
							{
								name: 'year',
								classes: 'govuk-input--width-4',
								value: currentDueDateDayMonthYear.year
							}
						]
					})
				}
			}
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
 * @returns { object }
 */
export const apiErrorMapper = (updatedDueDateDay, apiError) => ({
	'due-date-day': {
		value: String(updatedDueDateDay),
		msg: `Date ${apiError}`,
		param: '',
		location: 'body'
	}
});

/**
 * @param {AppealTimetableType} timetableType
 * @returns {string}
 */
const getTimetableTypeText = (timetableType) => {
	switch (timetableType) {
		case 'finalCommentReviewDate':
			return 'final comment review';
		case 'issueDeterminationDate':
			return 'issue determination';
		case 'lpaQuestionnaireDueDate':
			return 'LPA questionnaire';
		case 'statementReviewDate':
			return 'statement review';
		default:
			return '';
	}
};
