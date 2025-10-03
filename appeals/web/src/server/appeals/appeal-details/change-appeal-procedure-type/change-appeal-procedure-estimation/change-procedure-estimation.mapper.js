import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {string} action
 * @param {{inquiryEstimationYesNo: string, inquiryEstimationDays: number}} [values]
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {{backLinkUrl: string, title: string, pageComponents: {type: string, parameters: {name: string, fieldset: {legend: {classes: string, text: string, isPageHeading: boolean}}, idPrefix: string, items: [{conditional: {html: string}, text: string, value: string},{text: string, value: string}]}}[], preHeading: string}}
 */
export function inquiryEstimationPage(appealData, action, errors, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const inquiryEstimationComponent = {
		type: 'radios',
		parameters: {
			idPrefix: 'inquiry-estimation-yes-no',
			name: 'inquiryEstimationYesNo',
			fieldset: {
				legend: {
					text: 'Do you know the expected number of days to carry out the inquiry?',
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					value: 'yes',
					text: 'Yes',
					checked: values?.inquiryEstimationYesNo === 'yes',
					conditional: {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: 'inquiry-estimation-days',
									name: 'inquiryEstimationDays',
									value: values?.inquiryEstimationDays,
									...(errors && { errorMessage: { text: errors.msg } }),
									label: {
										text: 'Expected number of days to carry out the inquiry',
										classes: 'govuk-label--s'
									},
									suffix: {
										text: 'Days'
									},
									classes: 'govuk-input--width-3'
								}
							}
						])
					}
				},
				{
					value: 'no',
					text: 'No',
					checked: values?.inquiryEstimationYesNo === 'no'
				}
			]
		}
	};

	/** @type {PageContent} */
	return {
		title: `Appeal - ${shortAppealReference} ${action === 'setup' ? 'start' : 'update'} case`,
		backLinkUrl: `/appeals-service/appeal-details/${
			appealData.appealId
		}/change-appeal-procedure-type/${appealData?.procedureType?.toLowerCase()}/date`,
		preHeading: `Appeal ${shortAppealReference} - ${
			action === 'setup' ? 'set up' : 'change'
		} inquiry`,
		// @ts-ignore
		pageComponents: [inquiryEstimationComponent, errors]
	};
}
