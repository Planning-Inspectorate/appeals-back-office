import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @param {import('../../appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} backLinkUrl
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {Record<string, string>} [values]
 * @returns {PageContent}
 */
export const estimationPage = (appealDetails, backLinkUrl, errors, values) => {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent} */
	const hearingEstimationComponent = {
		type: 'radios',
		parameters: {
			idPrefix: 'hearing-estimation-yes-no',
			name: 'hearingEstimationYesNo',
			fieldset: {
				legend: {
					text: 'Do you know the expected number of days to carry out the hearing?',
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					value: 'yes',
					text: 'Yes',
					checked: values?.hearingEstimationYesNo === 'yes',
					conditional: {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: 'hearing-estimation-days',
									name: 'hearingEstimationDays',
									value: values?.hearingEstimationDays,
									...(errors && { errorMessage: { text: errors.msg } }),
									label: {
										text: 'Expected number of days to carry out the hearing',
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
					checked: values?.hearingEstimationYesNo === 'no'
				}
			]
		}
	};

	return {
		title: `Appeal ${shortAppealReference} - start case`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - start case`,
		// @ts-ignore
		pageComponents: [hearingEstimationComponent, errors],
		submitButtonProperties: {
			text: 'Continue',
			id: 'continue'
		}
	};
};
