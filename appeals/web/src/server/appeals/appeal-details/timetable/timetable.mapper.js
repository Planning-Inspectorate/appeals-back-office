import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
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
 * @typedef {'lpaQuestionnaireDueDate' | 'ipCommentsDueDate' | 'lpaStatementDueDate' | 'finalCommentsDueDate'} AppealTimetableType
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
 * @param {import('./timetable.service.js').AppealTimetables} appealTimetables
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 */
export const mapEditTimetablePage = (appealTimetables, appealDetails) => {
	/** @type {PageContent} */
	let pageContent = {
		title: `Timetable due dates`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		heading: `Timetable due dates`,
		submitButtonProperties: {
			text: 'Continue',
			type: 'submit'
		}
	};

	const timeTableTypes = getAppealTimetableTypes(appealDetails.appealType);

	/** @type {PageComponent[]} */
	const pageComponents = timeTableTypes.map((timetableType) => {
		const currentDueDateIso = appealTimetables && appealTimetables[timetableType];
		const currentDueDateDayMonthYear =
			currentDueDateIso && dateISOStringToDayMonthYearHourMinute(currentDueDateIso);
		const timetableTypeText = getTimetableTypeText(timetableType);
		const idText = getIdText(timetableType);

		return {
			type: 'date-input',
			parameters: {
				id: `${idText}-due-date`,
				namePrefix: `${idText}-due-date`,
				hint: {
					text: 'For example, 27 3 2007'
				},
				fieldset: {
					legend: {
						text: `${timetableTypeText} due`,
						classes: 'govuk-fieldset__legend--m'
					}
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
		};
	});

	pageContent.pageComponents = pageComponents;

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
		case 'lpaQuestionnaireDueDate':
			return 'LPA questionnaire';
		// case 'ipCommentsDueDate':
		// 	return 'Interested party comments';
		// case 'lpaStatementDueDate':
		// 	return 'LPA statement';
		// case 'finalCommentsDueDate':
		// 	return 'Final comments';
		default:
			return '';
	}
};

/**
 * @param {AppealTimetableType} timetableType
 * @returns {string}
 */
const getIdText = (timetableType) => {
	switch (timetableType) {
		case 'lpaQuestionnaireDueDate':
			return 'lpa-questionnaire';
		// case 'ipCommentsDueDate':
		// 	return 'ip-comments';
		// case 'lpaStatementDueDate':
		// 	return 'lpa-statement';
		// case 'finalCommentsDueDate':
		// 	return 'final-comments';
		default:
			return '';
	}
};

/**
 * @param {string|undefined|null} appealType
 * @returns {AppealTimetableType[]}
 */
const getAppealTimetableTypes = (appealType) => {
	/** @type {AppealTimetableType[]} */
	let validAppealTimetableType = [];

	switch (appealType) {
		case 'Householder':
			validAppealTimetableType = ['lpaQuestionnaireDueDate'];
			break;
		// case 'Planning appeal':
		// 	validAppealTimetableType = [
		// 		'lpaQuestionnaireDueDate',
		// 		'ipCommentsDueDate',
		// 		'lpaStatementDueDate',
		// 		'finalCommentsDueDate'
		// 	];
		// 	break;
	}
	return validAppealTimetableType;
};
