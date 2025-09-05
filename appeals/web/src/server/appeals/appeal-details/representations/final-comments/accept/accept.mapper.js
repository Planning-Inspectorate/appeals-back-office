import { redactInput } from '#appeals/appeal-details/representations/common/components/redact-input.js';
import { getAttachmentList } from '#appeals/appeal-details/representations/common/document-attachment-list.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { buttonComponent, simpleHtmlComponent, wrapComponents } from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { findButtonText } from '#lib/revert-text.js';
import { summaryList } from './components/summary-list.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} representation
 * @param {string} finalCommentsType
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageContent}
 */
export const acceptFinalCommentPage = (
	appealDetails,
	representation,
	finalCommentsType,
	session
) => {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const buttonText = findButtonText(finalCommentsType);
	/** @type {PageComponent[]} */
	const pageComponents = [
		wrapComponents(
			[
				simpleHtmlComponent(
					'p',
					{
						class: 'govuk-body govuk-!-margin-bottom-0'
					},
					'Original final comments:'
				),
				...redactInput({
					representation,
					labelText: 'Redacted final comments:',
					session,
					buttonText: buttonText
				}),
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
		title: 'Accept comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Accept ${formatFinalCommentsTypeText(finalCommentsType)} final comments`,
		pageComponents
	};

	return pageContent;
};

/**
 * @param {Appeal} appealDetails
 * @param {Representation} representation
 * @param {string} finalCommentsType
 * @returns {PageContent}
 */
export const confirmAcceptFinalCommentPage = (appealDetails, representation, finalCommentsType) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const attachmentsList = getAttachmentList(representation);

	/** @type {PageComponent[]} */
	const pageComponents = [
		summaryList(appealDetails, representation, finalCommentsType, attachmentsList)
	];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Confirm comment accept',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Check details and accept ${formatFinalCommentsTypeText(
			finalCommentsType
		)} final comments`,
		forceRenderSubmitButton: true,
		submitButtonText: `Accept ${formatFinalCommentsTypeText(finalCommentsType)} final comments`,
		pageComponents
	};

	return pageContent;
};

/**
 * @param {string} finalCommentsType
 * @returns {string}
 */
function formatFinalCommentsTypeText(finalCommentsType) {
	return finalCommentsType === 'lpa' ? 'LPA' : 'appellant';
}
