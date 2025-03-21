import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { wrapComponents, simpleHtmlComponent, buttonComponent } from '#lib/mappers/index.js';
import { redactInput } from '#appeals/appeal-details/representations/common/components/redact-input.js';
import { summaryList } from './components/summary-list.js';
import { formatFinalCommentsTypeText } from '../view-and-review/view-and-review.mapper.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} finalCommentsType
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageContent}
 */
export const redactFinalCommentPage = (appealDetails, comment, finalCommentsType, session) => {
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
					'Original final comments:'
				),
				{
					type: 'inset-text',
					parameters: {
						id: 'original-comment',
						classes: 'govuk-!-margin-top-2',
						html: '',
						pageComponents: [
							{
								type: 'show-more',
								parameters: {
									text: comment.originalRepresentation,
									labelText: 'Read more'
								}
							}
						]
					}
				},
				...redactInput({ representation: comment, labelText: 'Redacted final comments:', session }),
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
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Redact ${formatFinalCommentsTypeText(finalCommentsType)} final comments`,
		pageComponents
	};

	return pageContent;
};

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} finalCommentsType
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageContent}
 */
export const confirmRedactFinalCommentPage = (
	appealDetails,
	comment,
	finalCommentsType,
	session
) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const attachmentsList =
		comment.attachments.length > 0
			? buildHtmUnorderedList(
					comment.attachments.map(
						(a) =>
							`<a class="govuk-link" href="${mapDocumentDownloadUrl(
								a.documentVersion.document.caseId,
								a.documentVersion.document.guid,
								a.documentVersion.document.name
							)}" target="_blank">${a.documentVersion.document.name}</a>`
					)
			  )
			: null;

	/** @type {PageComponent[]} */
	const pageComponents = [
		summaryList(appealDetails, comment, finalCommentsType, attachmentsList, session)
	];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Confirm redaction',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/redact`,
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
