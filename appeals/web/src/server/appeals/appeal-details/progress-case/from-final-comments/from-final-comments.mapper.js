import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {number} appealId
 * @param {string} appealReference
 * @param {boolean} hasValidFinalCommentsAppellant
 * @param {boolean} hasValidFinalCommentsLPA
 * @returns {PageContent}
 */
export function fromFinalCommentsPage(
	appealId,
	appealReference,
	hasValidFinalCommentsAppellant,
	hasValidFinalCommentsLPA
) {
	let title = 'Confirm that you want to share final comments';
	let heading = 'Confirm that you want to share final comments';
	let infoText = '';
	let warningText =
		'Do not share until you have reviewed all of the supporting documents and redacted any sensitive information.';
	let submitButtonText = 'Share final comments';

	if (hasValidFinalCommentsAppellant && hasValidFinalCommentsLPA) {
		infoText = `We’ll share <a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/appellant">appellant final comments</a> and <a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/lpa">LPA final comments</a> with the relevant parties.`;
	} else if (hasValidFinalCommentsAppellant && !hasValidFinalCommentsLPA) {
		infoText = `We’ll share <a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/appellant">appellant final comments</a> with the relevant parties.`;
	} else if (!hasValidFinalCommentsAppellant && hasValidFinalCommentsLPA) {
		infoText = `We’ll share <a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/lpa">LPA final comments</a> with the relevant parties.`;
	} else if (!hasValidFinalCommentsAppellant && !hasValidFinalCommentsLPA) {
		title = 'Progress case';
		heading = 'Progress case';
		infoText = `There are no final comments to share.`;
		warningText = 'Do not progress the case if you are awaiting any late final comments.';
		submitButtonText = 'Progress case';
	}

	/** @type {PageContent} */
	const pageContent = {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading,
		pageComponents: [
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body">${infoText}</p>`
				}
			},
			{
				type: 'warning-text',
				wrapperHtml: {
					opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">',
					closing: '</div></div>'
				},
				parameters: {
					text: warningText
				}
			},
			{
				type: 'button',
				wrapperHtml: {
					opening:
						'<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds"><form action="" method="POST" novalidate>',
					closing: '</form></div></div>'
				},
				parameters: {
					text: submitButtonText,
					type: 'submit'
				}
			}
		]
	};

	return pageContent;
}
