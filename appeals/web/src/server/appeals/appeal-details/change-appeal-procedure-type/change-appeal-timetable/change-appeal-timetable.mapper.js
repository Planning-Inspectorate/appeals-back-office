import {
	getAppealTimetableTypes,
	getIdText,
	getTimetableTypeText
} from '#appeals/appeal-details/timetable/timetable.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute, getExampleDateHint } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} AppellantCase
 */

/**
 * @typedef {Object} AppealTimetables
 * @property {string?} [lpaQuestionnaireDueDate]
 * @property {string?} [ipCommentsDueDate]
 * @property {string?} [lpaStatementDueDate]
 * @property {string?} [finalCommentsDueDate]
 * @property {object | string | undefined} [errors]
 */

/**
 * @param {AppealTimetables} appealTimetable
 * @param {Appeal} appealDetails
 * @param {AppellantCase} appellantCase
 * @param {Record<string, any>} body
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const mapChangeTimetablePage = (
	appealTimetable,
	appealDetails,
	appellantCase,
	body,
	errors = undefined
) => {
	const timetableTypes = getAppealTimetableTypes(appealDetails, appellantCase);

	/** @type {PageContent} */
	let pageContent = {
		title: `Timetable due dates`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
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
			if (!(timetableType in appealTimetable)) {
				return undefined;
			}
			// @ts-ignore
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
