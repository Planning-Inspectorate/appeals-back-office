import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { addressToMultilineStringHtml, representationHasAddress } from '#lib/address-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Representation} comment - The comment object.
 * @returns {string}
 */
const generateRejectionReasonsList = (comment) => {
	const listItemsString = comment.rejectionReasons
		.reduce(
			(listItems, { name, text }) =>
				// @ts-ignore
				text?.length
					? [...listItems, ...text.map((item) => name + ': ' + item)]
					: [...listItems, name],
			[]
		)
		// @ts-ignore
		.map((item) => `<li>${item}</li>`)
		.join('');
	return `<ul class="govuk-list govuk-list--bullet">${listItemsString}</ul>`;
};

/**
 * Generates the comment summary list used in both view and review pages.
 * @param {number} appealId
 * @param {Representation} comment - The comment object.
 * @param {{ isReviewPage?: boolean }} [options]
 * @returns {PageComponent} The generated comment summary list component.
 */
export function generateCommentSummaryList(
	appealId,
	comment,
	{ isReviewPage } = { isReviewPage: false }
) {
	const hasAddress = representationHasAddress(comment);
	const commentIsDocument = !comment.originalRepresentation && comment.attachments?.length;
	const folderId = comment.attachments?.[0]?.documentVersion?.document?.folderId ?? null;

	const filteredAttachments = comment.attachments?.filter((attachment) => {
		const { isDeleted, latestVersionId } = attachment?.documentVersion?.document ?? {};
		return latestVersionId === attachment.version && !isDeleted;
	});

	const attachmentsList = filteredAttachments?.length
		? buildHtmlList({
				items: filteredAttachments.map(
					(a) =>
						`<a class="govuk-link" href="${mapDocumentDownloadUrl(
							a.documentVersion.document.caseId,
							a.documentVersion.document.guid,
							a.documentVersion.document.name
						)}" target="_blank">${a.documentVersion.document.name}</a>`
				),
				isOrderedList: true,
				isNumberedList: filteredAttachments.length > 1
		  })
		: null;

	const { address, name, email } = comment.represented || {};
	const redactMatching = checkRedactedText(
		comment.originalRepresentation,
		comment.redactedRepresentation
	);
	const rows = [
		{
			key: { text: 'Interested party' },
			value: { text: name || 'Not provided' }
		},
		{
			key: { text: 'Email' },
			value: { text: email || 'Not provided' }
		},
		{
			key: { text: 'Address' },
			value: hasAddress
				? { html: addressToMultilineStringHtml(address) }
				: { text: 'Not provided' },
			actions: {
				items: [
					{
						text: hasAddress ? 'Change' : 'Add',
						href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${
							comment.id
						}/edit/address?review=${isReviewPage}&editAddress=${hasAddress ? 'true' : 'false'}`,
						visuallyHiddenText: 'address'
					}
				]
			}
		},
		...(isReviewPage
			? []
			: [
					{
						key: { text: 'Site visit requested' },
						value: { text: comment.siteVisitRequested ? 'Yes' : 'No' },
						actions: {
							items: comment.siteVisitRequested
								? [
										{
											text: 'Change',
											href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${comment.id}/edit/site-visit-requested`,
											visuallyHiddenText: 'site visited requested'
										}
								  ]
								: []
						}
					}
			  ]),
		{
			key: { text: 'When did the interested party submit the comment?' },
			value: { html: dateISOStringToDisplayDate(comment.created) }
		},
		{
			key: {
				text: comment.redactedRepresentation && redactMatching ? 'Original comment' : 'Comment'
			},
			value: {
				text: commentIsDocument ? 'Added as a document' : comment.originalRepresentation
			},
			actions: {
				items:
					commentIsDocument || isReviewPage || (redactMatching && comment.redactedRepresentation)
						? []
						: [
								{
									text: 'Redact',
									href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${comment.id}/redact`
								}
						  ]
			}
		},
		...(comment.redactedRepresentation && redactMatching
			? [
					{
						key: { text: 'Redacted comment' },
						value: { text: comment.redactedRepresentation },
						actions: {
							items: [
								{
									text: 'Change',
									href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${comment.id}/redact`
								}
							]
						}
					}
			  ]
			: []),
		{
			key: { text: 'Supporting documents' },
			value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' },
			actions: {
				items: [
					...(filteredAttachments?.length
						? [
								{
									text: 'Manage',
									href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${comment.id}/manage-documents/${folderId}`,
									visuallyHiddenText: 'supporting documents'
								}
						  ]
						: []),
					{
						text: 'Add',
						href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${comment.id}/add-document`,
						visuallyHiddenText: 'supporting documents'
					}
				]
			}
		},
		...(isReviewPage || comment.status !== COMMENT_STATUS.INVALID
			? []
			: [
					{
						key: { text: 'Why was the comment rejected?' },
						value: { html: generateRejectionReasonsList(comment) }
					}
			  ])
	];

	return {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: { rows }
	};
}
