import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { getErrorByFieldname } from '#lib/error-handlers/change-screen-error-handlers.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @typedef {'lpaQuestionnaireDueDate' | 'ipCommentsDueDate' | 'lpaStatementDueDate' | 'finalCommentsDueDate'} AppealTimetableType
 */

/**
 * @param {import('./timetable.service.js').AppealTimetables} appealTimetable
 * @param {Appeal} appealDetails
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const mapEditTimetablePage = (appealTimetable, appealDetails, errors = undefined) => {
	const timeTableTypes = getAppealTimetableTypes(appealDetails);

	/** @type {PageContent} */
	let pageContent = {
		title: `Timetable due dates`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		heading: timeTableTypes.length > 1 ? `Timetable due dates` : ``,
		submitButtonProperties: {
			text: 'Continue',
			type: 'submit'
		}
	};

	/** @type {PageComponent[]} */
	const pageComponents = timeTableTypes.map((timetableType) => {
		const currentDueDateIso = appealTimetable && appealTimetable[timetableType];
		const currentDueDateDayMonthYear =
			currentDueDateIso && dateISOStringToDayMonthYearHourMinute(currentDueDateIso);
		const timetableTypeText = getTimetableTypeText(timetableType);
		const idText = getIdText(timetableType);

		const errorMessages = [];

		if (errors != undefined) {
			if (errors?.[`${idText}-due-date-day`]) {
				errorMessages.push(errors[`${idText}-due-date-day`].msg);
			}
			if (errors?.[`${idText}-due-date-month`]) {
				errorMessages.push(errors[`${idText}-due-date-month`].msg);
			}
			if (errors?.[`${idText}-due-date-year`]) {
				errorMessages.push(getErrorByFieldname(errors, `${idText}-due-date-year`)?.text);
			}
		}

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
						isPageHeading: timeTableTypes.length < 2,
						classes: 'govuk-fieldset__legend--m'
					}
				},
				errorMessage: errorMessages.length
					? {
							html: errorMessages.join('<br>')
					  }
					: undefined,
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
 * @param {AppealTimetableType} timetableType
 * @returns {string}
 */
const getTimetableTypeText = (timetableType) => {
	switch (timetableType) {
		case 'lpaQuestionnaireDueDate':
			return 'LPA questionnaire';
		case 'lpaStatementDueDate':
			return 'Statements';
		case 'ipCommentsDueDate':
			return 'Interested party comments';
		case 'finalCommentsDueDate':
			return 'Final comments';
		default:
			return '';
	}
};

/**
 * @param {AppealTimetableType} timetableType
 * @returns {string}
 */
export const getIdText = (timetableType) => {
	switch (timetableType) {
		case 'lpaQuestionnaireDueDate':
			return 'lpa-questionnaire';
		case 'ipCommentsDueDate':
			return 'ip-comments';
		case 'lpaStatementDueDate':
			return 'lpa-statement';
		case 'finalCommentsDueDate':
			return 'final-comments';
		default:
			return '';
	}
};

/**
 * @param {Appeal} appeal
 * @returns {AppealTimetableType[]}
 */
export const getAppealTimetableTypes = (appeal) => {
	/** @type {AppealTimetableType[]} */
	let validAppealTimetableType = [];

	switch (appeal.appealType) {
		case 'Householder':
			validAppealTimetableType = ['lpaQuestionnaireDueDate'];
			break;
		case 'Planning appeal':
			validAppealTimetableType = [];
			if (
				appeal.appealStatus === APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE &&
				appeal.documentationSummary?.lpaQuestionnaire?.status !== 'received'
			) {
				validAppealTimetableType.push('lpaQuestionnaireDueDate');
			}
			if (
				appeal.appealStatus === APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE ||
				appeal.appealStatus === APPEAL_CASE_STATUS.STATEMENTS
			) {
				validAppealTimetableType.push('lpaStatementDueDate', 'ipCommentsDueDate');
			}
			validAppealTimetableType.push('finalCommentsDueDate');
			break;
	}
	return validAppealTimetableType;
};
