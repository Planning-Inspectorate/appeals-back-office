import { appealShortReference } from '#lib/appeals-formatter.js';
import { enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml } from '#lib/enhance-html.js';

/**
 *
 * @param {string} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function decisionInvalidConfirmationPage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal invalid',
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: 'Appeal invalid',
					headingLevel: 1,
					html: `Appeal reference<br><strong>${appealShortReference(appealReference)}</strong>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: '<p class="govuk-body">The appeal has been closed. The relevant parties have been informed.</p>'
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a class="govuk-link" href="/appeals-service/appeal-details/${appealId}">Go back to case details</a></p>`
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {string} appealId
 * @param {string} appealReference
 * @param {import('#appeals/appeals.types.js').CheckboxItemParameter[]} mappedInvalidReasonOptions
 * @param {string | undefined} errorMessage
 * @returns {PageContent}
 */
export const mapInvalidReasonPage = (
	appealId,
	appealReference,
	mappedInvalidReasonOptions,
	errorMessage = undefined
) => {
	const shortAppealReference = appealShortReference(appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Why is the appeal invalid?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					name: 'invalidReason',
					idPrefix: 'invalid-reason',
					fieldset: {
						legend: {
							text: 'Why is the appeal invalid?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: mappedInvalidReasonOptions,
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	mappedInvalidReasonOptions
		// @ts-ignore
		.filter((option) => option.addAnother)
		.forEach((option) =>
			enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml(
				option,
				'invalidReason-',
				'invalid-reason-',
				'Which part is incorrect or incomplete?'
			)
		);
	return pageContent;
};
