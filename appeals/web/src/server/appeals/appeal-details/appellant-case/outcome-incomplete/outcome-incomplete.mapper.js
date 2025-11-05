import { appealShortReference } from '#lib/appeals-formatter.js';
import { enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml } from '#lib/enhance-html.js';

/**
 *
 * @param {string} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function decisionIncompleteConfirmationPage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal incomplete',
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: 'Appeal incomplete',
					headingLevel: 1,
					html: `Appeal reference<br><strong>${appealShortReference(appealReference)}</strong>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: '<p class="govuk-body">The relevant parties have been informed. We have told them what to do next and the due date for missing information.</p>'
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
 * @param {import('#appeals/appeals.types.js').CheckboxItemParameter[]} mappedIncompleteReasonOptions
 * @param {string | undefined} errorMessage
 * @returns {PageContent}
 */
export const mapIncompleteReasonPage = (
	appealId,
	appealReference,
	mappedIncompleteReasonOptions,
	errorMessage = undefined
) => {
	const shortAppealReference = appealShortReference(appealReference);

	mappedIncompleteReasonOptions.sort((a, b) => {
		// identify id 10 'other' and send to back of item list
		if (a.value === '10') return 1;

		if (b.value === '10') return -1;

		return +a.value - +b.value;
	});

	/** @type {PageContent} */
	const pageContent = {
		title: `Why is the appeal incomplete?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					name: 'incompleteReason',
					idPrefix: 'incomplete-reason',
					fieldset: {
						legend: {
							text: 'Why is the appeal incomplete?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: mappedIncompleteReasonOptions,
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	mappedIncompleteReasonOptions
		// @ts-ignore
		.filter((option) => option.addAnother)
		.forEach((option) =>
			enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml(
				option,
				'incompleteReason-',
				'incomplete-reason-',
				'Which part is incorrect or incomplete?'
			)
		);
	return pageContent;
};
