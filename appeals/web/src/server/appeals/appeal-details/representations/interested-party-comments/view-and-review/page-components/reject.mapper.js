import { rejectionReasonHtml } from '#appeals/appeal-details/representations/common/components/reject-reasons.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { editLink } from '#lib/edit-utilities.js';
import { simpleHtmlComponent } from '#lib/mappers/components/page-components/html.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { getDetailsForCommentResubmission } from '@pins/appeals/utils/notify.js';
import { getAttachmentList } from '../../../common/document-attachment-list.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RepresentationRejectionReason} RepresentationRejectionReason */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RejectionReasonUpdateInput} RejectionReasonUpdateInput */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RejectionReasons} RejectionReasons */

/**
 * @param {Appeal} appealDetails
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export function rejectInterestedPartyCommentPage(appealDetails, backLinkUrl) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const pageContent = {
		heading: 'Why are you rejecting the comment?',
		backLinkUrl,
		preHeading: `Appeal ${shortReference}`,
		hint: 'Select all that apply.'
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} backLinkUrl
 * @param {import('@pins/express').Session} [session]
 * @returns {Promise<PageContent>}
 * */
export async function rejectAllowResubmitPage(appealDetails, comment, backLinkUrl, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const { ipCommentsDueDate = null } = appealDetails.appealTimetable || {};
	const dueDate = ipCommentsDueDate ? new Date(ipCommentsDueDate) : null;
	const { resubmissionDueDate } = await getDetailsForCommentResubmission(true, dueDate);

	const sessionValue = (() => {
		if (session?.rejectIpComment?.commentId !== comment.id) {
			return null;
		}

		return session?.rejectIpComment?.allowResubmit;
	})();

	/** @type {PageContent} */
	const pageContent = {
		backLinkUrl,
		preHeading: `Appeal ${shortReference}`,
		submitButtonProperties: {
			text: 'Continue'
		},
		pageComponents: [
			yesNoInput({
				name: 'allowResubmit',
				value: sessionValue,
				legendText: 'Do you want to allow the interested party to resubmit a comment?',
				legendIsPageHeading: true,
				hint: `The interested party can resubmit their comment by ${resubmissionDueDate}.`
			})
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {number} folderId
 * @param {import('@pins/appeals.api').Appeals.RepresentationRejectionReason[]} rejectionReasons
 * @param {{ rejectionReasons: string[], allowResubmit: boolean }} payload
 * @returns {PageContent}
 * */
export function rejectCheckYourAnswersPage(
	appealDetails,
	comment,
	folderId,
	rejectionReasons,
	payload
) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const userProvidedEmail = Boolean(comment.represented.email);

	const commentHtml = (() => {
		if (comment.originalRepresentation) {
			return `<div class="pins-show-more">${comment.originalRepresentation}</div>`;
		}

		if (comment.attachments.length > 0) {
			return 'Added as a document';
		}

		return '';
	})();

	const attachmentsList = getAttachmentList(comment);

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Interested party'
					},
					value: {
						text: comment.represented.name
					}
				},
				{
					key: {
						text: 'Comment'
					},
					value: {
						html: commentHtml
					}
				},
				{
					key: {
						text: 'Supporting documents'
					},
					value: { html: attachmentsList || 'No documents' },
					actions: {
						items: [
							...(attachmentsList && attachmentsList.length > 0
								? [
										{
											text: 'Manage',
											href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/manage-documents/${folderId}/?backUrl=/interested-party-comments/${comment.id}/reject/check-your-answers`,
											visuallyHiddenText: 'supporting documents'
										}
								  ]
								: []),
							{
								text: 'Add',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/add-document/?backUrl=/interested-party-comments/${comment.id}/reject/check-your-answers`,
								visuallyHiddenText: 'supporting documents'
							}
						]
					}
				},
				{
					key: {
						text: 'Review decision'
					},
					value: {
						text: 'Comment rejected'
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/review`,
								visuallyHiddenText: 'review decision'
							}
						]
					}
				},
				{
					key: {
						text: 'Why are you rejecting the comment?'
					},
					value: {
						html: '',
						pageComponents: [
							{
								type: 'show-more',
								parameters: {
									html: rejectionReasonHtml(payload.rejectionReasons),
									labelText: 'Read more'
								}
							}
						]
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: editLink(
									`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/select-reason`
								),
								visuallyHiddenText: 'why you are rejecting the comment'
							}
						]
					}
				},
				...(userProvidedEmail
					? [
							{
								key: {
									text: 'Do you want to allow the interested party to resubmit a comment?'
								},
								value: {
									text: payload.allowResubmit ? 'Yes' : 'No'
								},
								actions: {
									items: [
										{
											text: 'Change',
											href: editLink(
												`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/allow-resubmit`
											),
											visuallyHiddenText:
												'if you want to allow the interested party to resubmit a comment'
										}
									]
								}
							}
					  ]
					: [])
			]
		}
	};

	/** @type {PageComponent} */
	const bottomText = simpleHtmlComponent(
		'p',
		{ class: 'govuk-body' },
		userProvidedEmail
			? 'We will send an email to the interested party to explain why you rejected their comment.'
			: 'We will not send an email to explain why you rejected the comment, as the interested party did not give their email address.'
	);

	const backLinkPath = userProvidedEmail ? 'allow-resubmit' : 'select-reason';

	/** @type {PageComponent[]} */
	const pageComponents = [summaryListComponent, bottomText];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		heading: 'Check details and reject comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/reject/${backLinkPath}`,
		preHeading: `Appeal ${shortReference}`,
		submitButtonProperties: {
			text: 'Reject comment'
		},
		pageComponents
	};

	return pageContent;
}
