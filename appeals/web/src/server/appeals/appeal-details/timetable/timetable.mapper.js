import { dateISOStringToDayMonthYearHourMinute, getExampleDateHint } from '#lib/dates.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from 'pins-data-model';
import { dateInput } from '#lib/mappers/index.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} AppellantCase
 */
/**
 * @typedef {'lpaQuestionnaireDueDate' | 'ipCommentsDueDate' | 'lpaStatementDueDate' | 'finalCommentsDueDate' | 'statementOfCommonGroundDueDate' | 'planningObligationDueDate'} AppealTimetableType
 */

/**
 * @param {import('./timetable.service.js').AppealTimetables} appealTimetable
 * @param {Appeal} appealDetails
 * @param {AppellantCase} appellantCase
 * @param {Record<string, any>} body
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const mapEditTimetablePage = (
	appealTimetable,
	appealDetails,
	appellantCase,
	body,
	errors = undefined
) => {
	const timeTableTypes = getAppealTimetableTypes(appealDetails, appellantCase);

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

		/** @type {PageComponent} */
		return dateInput({
			name: `${idText}-due-date`,
			id: `${idText}-due-date`,
			namePrefix: `${idText}-due-date`,
			value: currentDueDateDayMonthYear
				? {
						day: body[`${idText}-due-date-day`] ?? currentDueDateDayMonthYear?.day,
						month: body[`${idText}-due-date-month`] ?? currentDueDateDayMonthYear?.month,
						year: body[`${idText}-due-date-year`] ?? currentDueDateDayMonthYear?.year
				  }
				: {},
			legendText: `${timetableTypeText} due`,
			hint: `For example, ${getExampleDateHint(45)}`,
			legendClasses:
				timeTableTypes.length > 1 ? 'govuk-fieldset__legend--m' : 'govuk-fieldset__legend--l',
			errors: errors
		});
	});

	pageContent.pageComponents = pageComponents;

	return pageContent;
};

/**
 * @param {AppealTimetableType} timetableType
 * @returns {string}
 */
export const getTimetableTypeText = (timetableType) => {
	switch (timetableType) {
		case 'lpaQuestionnaireDueDate':
			return 'LPA questionnaire';
		case 'lpaStatementDueDate':
			return 'Statements';
		case 'ipCommentsDueDate':
			return 'Interested party comments';
		case 'finalCommentsDueDate':
			return 'Final comments';
		case 'statementOfCommonGroundDueDate':
			return 'Statement of common ground';
		case 'planningObligationDueDate':
			return 'Planning obligation';
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
		case 'statementOfCommonGroundDueDate':
			return 'statement-of-common-ground';
		case 'planningObligationDueDate':
			return 'planning-obligation';
		default:
			return '';
	}
};

/**
 * @param {Appeal} appeal
 * @param {AppellantCase} appellantCase
 * @returns {AppealTimetableType[]}
 */
export const getAppealTimetableTypes = (appeal, appellantCase) => {
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
			if (appeal.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.WRITTEN) {
				validAppealTimetableType.push('finalCommentsDueDate');
			}
			if (appeal.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.HEARING) {
				validAppealTimetableType.push('statementOfCommonGroundDueDate');
				if (appellantCase.planningObligation?.hasObligation) {
					validAppealTimetableType.push('planningObligationDueDate');
				}
			}
			break;
	}
	return validAppealTimetableType;
};
