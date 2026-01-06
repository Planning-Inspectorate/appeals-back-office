import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute, getExampleDateHint } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';
import { enforcementIssueDateField } from './enforcement-issue-date.constants.js';

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
export const changeEnforcementIssueDatePage = (
	appealData,
	appellantCaseData,
	errors,
	dateEntered
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let { day, month, year } = dateEntered;

	if (!errors && appellantCaseData.enforcementNotice?.issueDate) {
		const formattedDate = dateISOStringToDayMonthYearHourMinute(
			appellantCaseData.enforcementNotice.issueDate
		);

		day = String(formattedDate.day);
		month = String(formattedDate.month);
		year = String(formattedDate.year);
	}

	// Correct automatic error formatting
	if (errors && errors['enforcement-issue-date-day']?.msg) {
		errors['enforcement-issue-date-day'].msg = errors['enforcement-issue-date-day'].msg.replace(
			'The the',
			'the'
		);
	}

	if (errors && `${day}${month}${year}`.trim() === '') {
		errors['enforcement-issue-date-day'].msg = 'Enter the issue date on your enforcement notice';
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Enforcement issue date - validation - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		// /** @type {PageComponent} */

		pageComponents: [
			dateInput({
				name: enforcementIssueDateField,
				id: enforcementIssueDateField,
				namePrefix: enforcementIssueDateField,
				value: {
					day: day,
					month: month,
					year: year
				},
				legendText: `What is the issue date on your enforcement notice?`,
				legendIsPageHeading: true,
				hint: `For example, ${getExampleDateHint(-27)}`,
				errors: errors
			})
		]
	};

	return pageContent;
};
