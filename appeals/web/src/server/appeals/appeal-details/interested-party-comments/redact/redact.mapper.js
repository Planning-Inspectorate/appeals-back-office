import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { wrapComponents, simpleHtmlComponent, buttonComponent } from '#lib/mappers/index.js';
import { redactInput } from '../../representations/common/components/redact-input.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageContent}
 */
export const redactInterestedPartyCommentPage = (appealDetails, comment, session) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent[]} */
	const pageComponents = [
		wrapComponents(
			[
				simpleHtmlComponent(
					'p',
					{
						class: 'govuk-body govuk-!-margin-bottom-0'
					},
					'Original comment:'
				),
				{
					type: 'inset-text',
					parameters: {
						text: comment.originalRepresentation,
						id: 'original-comment',
						classes: 'govuk-!-margin-top-2'
					}
				},
				...redactInput({ comment, labelText: 'Redacted comment', session }),
				buttonComponent(
					'Continue',
					{ type: 'submit' },
					{
						wrapperHtml: {
							opening: '<div class="govuk-button-group">',
							closing: '</div>'
						}
					}
				)
			],
			{
				opening:
					'<div class="govuk-grid-row"><form method="POST" class="govuk-grid-column-two-thirds">',
				closing: '</form></div>'
			}
		)
	];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Redact comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/review`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Check details and redact comment',
		headingClasses: 'govuk-heading-l',
		pageComponents
	};

	return pageContent;
};
