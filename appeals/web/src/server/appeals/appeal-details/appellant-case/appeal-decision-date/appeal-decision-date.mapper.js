import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';
import { appealDecisionDateField } from './appeal-decision-date.constants.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../../../appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {{day: string, month: string, year: string}} dateEntered
 * @returns {PageContent}
 */
export const ChangeAppealDecisionDatePage = (
	appealData,
	appellantCaseData,
	errors,
	dateEntered
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let { day, month, year } = dateEntered;

	if (!errors && appellantCaseData.enforcementNotice?.appealDecisionDate) {
		const formattedDate = dateISOStringToDayMonthYearHourMinute(
			appellantCaseData.enforcementNotice.appealDecisionDate
		);

		day = String(formattedDate.day);
		month = String(formattedDate.month);
		year = String(formattedDate.year);
	}

	// Correct automatic error formatting
	if (errors && errors['appeal-decision-date-day']?.msg) {
		const msg = errors['appeal-decision-date-day'].msg;
		errors['appeal-decision-date-day'].msg = msg.replace('The the', 'The');
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Appeal decision date - validation - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		// /** @type {PageComponent} */

		pageComponents: [
			dateInput({
				name: appealDecisionDateField,
				id: appealDecisionDateField,
				namePrefix: appealDecisionDateField,
				value: {
					day: day,
					month: month,
					year: year
				},
				legendText: `When was the appeal decision?`,
				legendIsPageHeading: true,
				hint: 'For example, 31 3 2024',
				errors: errors
			})
		]
	};

	return pageContent;
};
