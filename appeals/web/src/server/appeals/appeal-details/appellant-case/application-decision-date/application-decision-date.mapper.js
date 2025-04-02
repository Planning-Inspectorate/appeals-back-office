/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';

/**
 * @typedef {import('../../../../appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {DayMonthYearHourMinute} storedSessionData
 * @returns {PageContent}
 */
export const changeApplicationDecisionDatePage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let day = '';
	let month = '';
	let year = '';

	if (storedSessionData?.day && storedSessionData?.month && storedSessionData?.year) {
		day = String(storedSessionData.day);
		month = String(storedSessionData.month);
		year = String(storedSessionData.year);
	} else if (appellantCaseData.applicationDecisionDate) {
		const formattedApplicationDecisionDate = dateISOStringToDayMonthYearHourMinute(
			appellantCaseData.applicationDecisionDate
		);

		day = String(formattedApplicationDecisionDate.day);
		month = String(formattedApplicationDecisionDate.month);
		year = String(formattedApplicationDecisionDate.year);
	}

	/** @type {PageContent} */
	const pageContent = {
		title: 'What’s the date on the decision letter from the local planning authority?​',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'date-input',
				parameters: {
					name: 'applicationDecisionDate',
					id: 'application-decision-date',
					namePrefix: 'application-decision-date',
					fieldset: {
						legend: {
							text: 'What’s the date on the decision letter from the local planning authority?​',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					hint: {
						text: 'For example, 27 3 2007'
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
