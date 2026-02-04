import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {'gain'|'loss'|'noChange'} WebNetResidence

 */

/**
 * @param {Appeal} appealData
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 *  @param {WebNetResidence|null|undefined} netResidence
 *  @param {string|null|undefined} netLoss
 *  @param {string|null|undefined} netGain
 * @param {string|undefined} backUrl
 * @returns {PageContent}
 */
export function addNetResidence(appealData, errors, netResidence, netLoss, netGain, backUrl) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const title = 'Is there a net gain or loss of residential units?';

	/** @type {PageComponent} */
	const selectResubmitAppealComponent = {
		type: 'radios',
		parameters: {
			name: 'net-residence',
			idPrefix: 'net-residence',
			value: netResidence,
			fieldset: {
				legend: {
					text: title,
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					text: 'Net gain',
					value: 'gain',
					conditional: {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: 'net-gain',
									name: 'net-gain',
									label: {
										text: 'Net gain'
									},
									classes: 'govuk-input--width-3',
									errorMessage: errors?.['net-gain']
										? {
												text: errors?.['net-gain'].msg
											}
										: null,
									value: netGain || ''
								}
							}
						])
					}
				},
				{
					text: 'Net loss',
					value: 'loss',
					conditional: {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: 'net-loss',
									name: 'net-loss',
									label: {
										text: 'Net loss'
									},
									classes: 'govuk-input--width-3',
									errorMessage: errors?.['net-loss']
										? {
												text: errors?.['net-loss'].msg
											}
										: null,
									value: netLoss || ''
								}
							}
						])
					}
				},
				{
					text: 'No change in number of residential units',
					value: 'noChange'
				}
			],
			errorMessage: errors?.['net-residence'] && { text: errors?.['net-residence'].msg }
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: title,
		backLinkUrl: backUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectResubmitAppealComponent],
		submitButtonText: 'Save and return'
	};

	return pageContent;
}
