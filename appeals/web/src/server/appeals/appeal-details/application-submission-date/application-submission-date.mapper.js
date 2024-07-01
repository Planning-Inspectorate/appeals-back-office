/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

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
	const formattedApplicationDate = new Date(appellantCaseData.applicationDate);

	const day = storedSessionData?.day ?? formattedApplicationDate.getDate();
	const month = storedSessionData?.month ?? formattedApplicationDate.getMonth() + 1;
	const year = storedSessionData?.year ?? formattedApplicationDate.getFullYear();

	/** @type {PageContent} */
	const pageContent = {
		title: `Change the application date`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change the application date`,
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
