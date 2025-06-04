import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';
import { applicationSubmissionDateField } from './application-submission-date.constants.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../../../appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{day: string, month: string, year: string}} storedSessionData
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const changeApplicationSubmissionDatePage = (
	appealData,
	appellantCaseData,
	storedSessionData,
	errors
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let day = '';
	let month = '';
	let year = '';

	if (storedSessionData) {
		day = String(storedSessionData.day);
		month = String(storedSessionData.month);
		year = String(storedSessionData.year);
	} else if (!storedSessionData && appellantCaseData.applicationDate) {
		const formattedApplicationDecisionDate = dateISOStringToDayMonthYearHourMinute(
			appellantCaseData.applicationDate
		);

		day = String(formattedApplicationDecisionDate.day);
		month = String(formattedApplicationDecisionDate.month);
		year = String(formattedApplicationDecisionDate.year);
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `What date did you submit your application?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		// /** @type {PageComponent} */

		pageComponents: [
			dateInput({
				name: applicationSubmissionDateField,
				id: applicationSubmissionDateField,
				namePrefix: applicationSubmissionDateField,
				value: {
					day: day,
					month: month,
					year: year
				},
				legendText: `What date did you submit your application?`,
				legendIsPageHeading: true,
				hint: 'For example, 27 3 2023',
				errors: errors
			})
		]
	};

	return pageContent;
};
