import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute, getExampleDateHint } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} AppellantCase
 */

/**
 * @typedef {'lpaQuestionnaireDueDate' | 'ipCommentsDueDate' | 'lpaStatementDueDate' | 'finalCommentsDueDate' | 'statementOfCommonGroundDueDate' | 'planningObligationDueDate'} AppealTimetableType
 */

/**
 * @typedef {import('../change-appeal-procedure-type.controller.js').AppealTimetable} AppealTimetable
 */

/**
 * @typedef {import('../change-appeal-procedure-type.controller.js').ChangeProcedureType} ChangeProcedureTypeSession
 */

/**
 * @param {ChangeProcedureTypeSession} session
 * @param {Appeal} appealDetails
 * @param {AppellantCase} appellantCase
 * @param {Record<string, any>} body
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const mapChangeTimetablePage = (
	session,
	appealDetails,
	appellantCase,
	body,
	errors = undefined
) => {
	const timetableTypes = getTimetableTypes(appealDetails, appellantCase, session.appealProcedure);

	/** @type {PageContent} */
	let pageContent = {
		title: `Timetable due dates`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-procedure-type/change-selected-procedure-type`,
		preHeading: `Appeal ${appealShortReference(
			appealDetails.appealReference
		)} - update appeal procedure`,
		heading: timetableTypes.length > 1 ? `Timetable due dates` : ``,
		submitButtonProperties: {
			text: 'Continue',
			type: 'submit'
		}
	};

	/** @type {PageComponent[]} */
	const pageComponents = timetableTypes
		.map((timetableType) => {
			// @ts-ignore
			const currentDueDateIso = session.appealTimetable && session.appealTimetable[timetableType];
			const currentDueDateDayMonthYear =
				currentDueDateIso && dateISOStringToDayMonthYearHourMinute(currentDueDateIso);
			const timetableTypeText = getTimetableTypeText(timetableType);
			const idText = getIdText(timetableType);

			/** @type {PageComponent} */
			return dateInput({
				name: `${idText}-due-date`,
				id: `${idText}-due-date`,
				namePrefix: `${idText}-due-date`,
				value: {
					// @ts-ignore
					day: body[`${idText}-due-date-day`] ?? currentDueDateDayMonthYear?.day,
					// @ts-ignore
					month: body[`${idText}-due-date-month`] ?? currentDueDateDayMonthYear?.month,
					// @ts-ignore
					year: body[`${idText}-due-date-year`] ?? currentDueDateDayMonthYear?.year
				},
				legendText: `${timetableTypeText} due`,
				hint: `For example, ${getExampleDateHint(45)}`,
				legendClasses:
					timetableType.length > 1 ? 'govuk-fieldset__legend--m' : 'govuk-fieldset__legend--l',
				errors: errors
			});
		})
		.filter(isDefined);

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
 * @param {string} newProcedureType
 * @returns {AppealTimetableType[]}
 */
export const getTimetableTypes = (appeal, appellantCase, newProcedureType) => {
	/** @type {AppealTimetableType[]} */
	let validAppealTimetableType = [];

	switch (appeal.appealType) {
		case APPEAL_TYPE.S78:
			validAppealTimetableType = [
				'lpaQuestionnaireDueDate',
				'lpaStatementDueDate',
				'ipCommentsDueDate'
			];
			if (newProcedureType.toLowerCase() === APPEAL_CASE_PROCEDURE.WRITTEN) {
				validAppealTimetableType.push('finalCommentsDueDate');
			}
			if (newProcedureType.toLowerCase() === APPEAL_CASE_PROCEDURE.HEARING) {
				validAppealTimetableType.push('statementOfCommonGroundDueDate');
				if (appellantCase.planningObligation?.hasObligation) {
					validAppealTimetableType.push('planningObligationDueDate');
				}
			}
			if (newProcedureType.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY) {
				validAppealTimetableType.push('statementOfCommonGroundDueDate');
				if (appellantCase.planningObligation?.hasObligation) {
					validAppealTimetableType.push('planningObligationDueDate');
				}
			}
			break;
	}
	return validAppealTimetableType;
};
