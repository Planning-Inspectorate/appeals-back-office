import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealData
 * @param {string|undefined} errorMessage
 * @returns {PageContent}
 */
export function mapCancelAppealPage(appealData, errorMessage) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Why are you cancelling the appeal?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - cancel appeal`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'cancelReasonRadio',
					idPrefix: 'cancel-reason-radio',
					fieldset: {
						legend: {
							text: 'Why are you cancelling the appeal?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'invalid',
							text: 'Appeal invalid'
						},
						{
							value: 'withdrawal',
							text: 'Request to withdraw appeal'
						}
					],
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	return pageContent;
}
