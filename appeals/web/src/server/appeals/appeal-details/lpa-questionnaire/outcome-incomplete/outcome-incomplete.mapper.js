import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 *
 * @param {string} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function decisionIncompleteConfirmationPage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'LPA questionnaire incomplete',
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: 'LPA questionnaire incomplete',
					headingLevel: 1,
					html: `Appeal reference<br><strong>${appealShortReference(appealReference)}</strong>`
				}
			},

			{
				type: 'html',
				parameters: {
					html: '<p class="govuk-body">The relevant parties have been informed .</p>'
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
