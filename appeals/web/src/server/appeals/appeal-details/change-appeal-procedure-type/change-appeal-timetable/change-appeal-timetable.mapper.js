import {
	getIdText,
	getTimetableTypeText
} from '#appeals/appeal-details/timetable/timetable.mapper.js';
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
 * @param {string} procedureType
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const mapChangeTimetablePage = (
	session,
	appealDetails,
	appellantCase,
	body,
	procedureType,
	errors = undefined
) => {
	const timetableTypes = getTimetableTypes(
		appealDetails.appealType,
		appellantCase.planningObligation?.hasObligation ?? false,
		session.appealProcedure
	);

	/** @type {PageContent} */
	let pageContent = {
		title: `Timetable due dates`,
		backLinkUrl:
			procedureType === APPEAL_CASE_PROCEDURE?.WRITTEN
				? `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-procedure-type/${procedureType}/change-selected-procedure-type`
				: procedureType === APPEAL_CASE_PROCEDURE?.HEARING && session.dateKnown === 'yes'
				? `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-procedure-type/${procedureType}/date`
				: procedureType === APPEAL_CASE_PROCEDURE?.HEARING && session.dateKnown === 'no'
				? `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-procedure-type/${procedureType}/change-event-date-known`
				: `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-procedure-type/${procedureType}/address-details`,
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
 * @param {string|undefined|null} appealType
 * @param {boolean} hasObligation
 * @param {string} newProcedureType
 * @returns {AppealTimetableType[]}
 */
export const getTimetableTypes = (appealType, hasObligation, newProcedureType) => {
	/** @type {AppealTimetableType[]} */
	let validAppealTimetableType = [];

	switch (appealType) {
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
				if (hasObligation) {
					validAppealTimetableType.push('planningObligationDueDate');
				}
			}
			if (newProcedureType.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY) {
				validAppealTimetableType.push('statementOfCommonGroundDueDate');
				if (hasObligation) {
					validAppealTimetableType.push('planningObligationDueDate');
				}
			}
			break;
	}
	return validAppealTimetableType;
};
