import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../../../appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{day: string, month: string, year: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeApplicationSubmissionDatePage = (
	appealData,
	appellantCaseData,
	storedSessionData
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
		title: `Change date application submitted`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change date application submitted`,
		pageComponents: [
			{
				type: 'date-input',
				parameters: {
					name: 'applicationSubmissionDate',
					id: 'application-submission-date',
					namePrefix: 'application-submission-date',
					hint: {
						text: 'For example, 27 3 2007'
					},
					fieldSet: {
						legend: {
							text: `When was the application submitted?`,
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							classes: 'govuk-input--width-2',
							name: 'day',
							value: day
						},
						{
							classes: 'govuk-input--width-2',
							name: 'month',
							value: month
						},
						{
							classes: 'govuk-input--width-4',
							name: 'year',
							value: year
						}
					]
				}
			}
		]
	};

	return pageContent;
};
