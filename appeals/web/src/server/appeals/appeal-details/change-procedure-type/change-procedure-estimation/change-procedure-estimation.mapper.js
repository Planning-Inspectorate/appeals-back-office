import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {string} action
 * @param {{estimationYesNo: string, estimationDays: number}} [values]
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {string} newProcedureType
 * @returns {{backLinkUrl: string, title: string, pageComponents: {type: string, parameters: {name: string, fieldset: {legend: {classes: string, text: string, isPageHeading: boolean}}, idPrefix: string, items: [{conditional: {html: string}, text: string, value: string},{text: string, value: string}]}}[], preHeading: string}}
 */
export function estimationPage(appealData, action, newProcedureType, errors, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const estimationComponent = {
		type: 'radios',
		parameters: {
			idPrefix: 'estimation-yes-no',
			name: 'estimationYesNo',
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
					checked: values?.estimationYesNo === 'yes',
					conditional: {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: 'estimation-days',
									name: 'estimationDays',
									value: values?.estimationDays,
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
					checked: values?.estimationYesNo === 'no'
				}
			]
		}
	};

	/** @type {PageContent} */
	return {
		title: `Appeal - ${shortAppealReference} ${action === 'setup' ? 'start' : 'update'} case`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/change-appeal-procedure-type/${newProcedureType}/date`,
		preHeading: `Appeal ${shortAppealReference} - ${
			action === 'setup' ? 'set up' : 'change'
		} inquiry`,
		// @ts-ignore
		pageComponents: [estimationComponent, errors]
	};
}
