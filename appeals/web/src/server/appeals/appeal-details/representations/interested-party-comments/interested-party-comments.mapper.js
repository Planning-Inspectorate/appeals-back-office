import { appealShortReference } from '#lib/appeals-formatter.js';
import { addressToString } from '#lib/address-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { mapNotificationBannersFromSession, wrapComponents } from '#lib/mappers/index.js';
import { addressInputs } from '#lib/mappers/index.js';
import { simpleHtmlComponent } from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { highlightRedactedSections } from '#lib/redaction-string-formatter.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse */
/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {import('#appeals/appeal-details/representations/types.js').RepresentationList} RepresentationList */

/**
 *
 * @param {Appeal} appealDetails
 * @param {RepresentationList} awaitingReview
 * @param {RepresentationList} valid
 * @param {RepresentationList} invalid
 * @param {import('@pins/express').Session} session
 * @param {string | undefined} backUrl
 * @param {import('@pins/express').Request} request
 * @returns {Promise<PageContent>}
 */
export async function interestedPartyCommentsPage(
	appealDetails,
	awaitingReview,
	valid,
	invalid,
	session,
	backUrl,
	request
) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const notificationBanners = mapNotificationBannersFromSession(
		session,
		'ipComments',
		appealDetails.appealId
	);

	const pageContent = {
		title: 'Interested party comments',
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		addCommentUrl: addBackLinkQueryToUrl(
			request,
			`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add`
		),
		preHeading: `Appeal ${shortReference}`,
		heading: 'Interested party comments',
		pageComponents: [...notificationBanners],
		awaitingReviewTable: createTable(awaitingReview, true),
		validTable: createTable(valid, false),
		invalidTable: createTable(invalid, false)
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {import('../types.js').Representation['represented']['address'] | Record<string, string>} address
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {string} backLinkUrl
 * @param {string} operationType
 * @returns {PageContent}
 * */
export const ipAddressPage = (appealDetails, address, errors, backLinkUrl, operationType) => ({
	title: "Interested party's address",
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: "Interested party's address",
	pageComponents: addressInputs({ address, operationType, errors })
});

/**
 * Creates a table object for the interested party comments.
 * @param {RepresentationList} commentsData - The comments data including items and metadata.
 * @param {boolean} isReview - Whether the table is for comments awaiting review.
 * @returns {Object} The table object or an empty object if there are no items.
 */
function createTable(commentsData, isReview = false) {
	return commentsData.itemCount > 0
		? {
				head: [{ text: 'Interested party' }, { text: 'Submitted' }, { text: 'Action' }],
				rows: generateTableRows(commentsData.items, isReview)
		  }
		: {};
}

/**
 * Generates table rows for the interested party comments.
 * @param {Representation[]} items - List of comments to generate rows for.
 * @param {boolean} isReview - Whether the table is for comments awaiting review.
 * @returns {Array<Array<{text?: string, html?: string}>>} The formatted table rows.
 */
function generateTableRows(items, isReview = false) {
	return items.map((comment) => [
		{ text: comment.author, classes: 'govuk-!-width-one-half' },
		{ text: dateISOStringToDisplayDate(comment.created), classes: 'govuk-!-width-one-half' },
		{
			html: `<a href="./interested-party-comments/${comment.id}/${
				isReview ? 'review' : 'view'
			}" class="govuk-link">${
				isReview ? 'Review' : 'View'
			}<span class="govuk-visually-hidden"> interested party comments from ${
				comment.author
			}</span></a>`,
			classes: 'govuk-!-width-one-half'
		}
	]);
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation[]} comments
 * @param {string} [backUrl]
 * @returns {PageContent}
 * */
export function sharedIpCommentsPage(appealDetails, comments, backUrl) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent} */
	const table = {
		type: 'table',
		parameters: {
			head: [
				{
					text: 'Address',
					classes: 'govuk-!-width-one-quarter'
				},
				{
					text: 'Comment',
					classes: 'govuk-!-width-one-half'
				},
				{
					text: 'Supporting documents',
					classes: 'govuk-!-width-one-quarter'
				}
			],
			rows: comments.map((comment) => [
				{
					html: addressToString(comment.represented.address) || 'No address'
				},
				{
					html: '',
					pageComponents: [
						{
							type: 'show-more',
							parameters: {
								html: comment.redactedRepresentation
									? highlightRedactedSections(
											comment.redactedRepresentation,
											comment.originalRepresentation
									  )
									: comment.originalRepresentation || 'No comment',
								labelText: 'Read more'
							}
						}
					]
				},
				{
					html: buildHtmlList({
						items: comment.attachments?.length
							? comment.attachments.map(
									(a) =>
										`<a class="govuk-link" href="${mapDocumentDownloadUrl(
											a.documentVersion.document.caseId,
											a.documentVersion.document.guid,
											a.documentVersion.document.name
										)}" target="_blank">${a.documentVersion.document.name}</a>`
							  )
							: ['No documents'],
						isOrderedList: true,
						isNumberedList: comment.attachments.length > 1
					})
				}
			])
		}
	};

	const pageComponents = [
		wrapComponents(
			[
				simpleHtmlComponent(
					'a',
					{
						href: `/documents/${appealDetails.appealId}/bulk-download/documents`,
						class: 'govuk-link'
					},
					'Download all documents'
				)
			],
			{
				opening: '<p class="govuk-body">',
				closing: '</p>'
			}
		),
		simpleHtmlComponent('h2', {}, 'Shared IP comments'),
		table
	];

	preRenderPageComponents(pageComponents);

	return {
		title: 'Interested party comments',
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Interested party comments',
		pageComponents: pageComponents
	};
}
