import { appealShortReference } from '#lib/appeals-formatter.js';
import { getErrorByFieldname } from '#lib/error-handlers/change-screen-error-handlers.js';
import { mapNotificationBannersFromSession } from '#lib/mappers/index.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { generateCommentSummaryList } from './common.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {import('@pins/express').Session} session
 * @param {import("@pins/express").ValidationErrors} [errors]
 * @returns {PageContent}
 */
export function reviewInterestedPartyCommentPage(appealDetails, comment, session, errors) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const commentSummaryList = generateCommentSummaryList(appealDetails.appealId, comment, {
		isReviewPage: true
	});

	const siteVisitFieldName = 'site-visit-request';
	/** @type {PageComponent} */
	const siteVisitRequestCheckbox = {
		type: 'checkboxes',
		parameters: {
			name: siteVisitFieldName,
			idPrefix: siteVisitFieldName,
			items: [
				{
					text: 'Comment includes a site visit request',
					value: 'site-visit',
					checked: comment?.siteVisitRequested
				}
			],
			errorMessage: getErrorByFieldname(errors, siteVisitFieldName)
		}
	};

	/** @type {PageComponent} */
	const commentValidityRadioButtons = {
		type: 'radios',
		parameters: {
			name: 'status',
			idPrefix: 'status',
			fieldset: {
				legend: {
					text: 'Review decision',
					isPageHeading: false,
					classes: 'govuk-fieldset__legend--m'
				}
			},
			items: [
				{
					value: COMMENT_STATUS.VALID,
					text: 'Accept comment',
					checked: comment?.status === COMMENT_STATUS.VALID
				},
				...[
					comment.source === 'citizen' && comment.originalRepresentation
						? {
								value: COMMENT_STATUS.VALID_REQUIRES_REDACTION,
								text: 'Redact and accept comment',
								checked: false // This status isn't persisted so will always be unchecked
							}
						: null
				].filter(Boolean),
				{
					value: COMMENT_STATUS.INVALID,
					text: 'Reject comment',
					checked:
						comment?.status === COMMENT_STATUS.INVALID ||
						(comment?.status === COMMENT_STATUS.AWAITING_REVIEW &&
							session.rejectIpComment?.commentId === comment.id)
				}
			]
		}
	};

	const pageContent = {
		title: 'Review comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Review comment',
		submitButtonText: 'Confirm',
		pageComponents: [
			...mapNotificationBannersFromSession(session, 'reviewIpComment', appealDetails.appealId),
			commentSummaryList,
			siteVisitRequestCheckbox,
			commentValidityRadioButtons
		]
	};

	return pageContent;
}
