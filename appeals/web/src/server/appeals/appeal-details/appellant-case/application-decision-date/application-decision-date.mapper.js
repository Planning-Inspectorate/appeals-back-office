/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';
import { dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';

/**
 * @typedef {import('../../../../appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{day: string, month: string, year: string, radio: string}} storedSessionData
 * @returns {PageContent}
 */
export const changeApplicationHasDecisionDatePage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Change the application decision date`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Was an application decision made?`,
		pageComponents: [
			yesNoInput({
				name: 'application-decision-radio',
				value:
					storedSessionData?.radio === 'yes' || Boolean(appellantCaseData.applicationDecisionDate)
			})
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {DayMonthYearHourMinute} storedSessionData
 * @returns {PageContent}
 */
export const changeApplicationSetDecisionDatePage = (
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
	} else if (!storedSessionData && appellantCaseData.applicationDecisionDate) {
		const formattedApplicationDecisionDate = dateISOStringToDayMonthYearHourMinute(
			appellantCaseData.applicationDecisionDate
		);

		day = String(formattedApplicationDecisionDate.day);
		month = String(formattedApplicationDecisionDate.month);
		year = String(formattedApplicationDecisionDate.year);
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Change the application decision date`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case/application-decision-date/change`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change the application decision date`,
		pageComponents: [
			{
				type: 'date-input',
				parameters: {
					name: 'applicationDecisionDate',
					id: 'application-decision-date',
					namePrefix: 'application-decision-date',
					hint: {
						text: 'For example, 27 3 2007'
					},
					fieldSet: {
						legend: {
							text: `When was the decision made for the application?`,
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
