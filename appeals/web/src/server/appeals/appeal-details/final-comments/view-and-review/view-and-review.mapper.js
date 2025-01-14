import { appealShortReference } from '#lib/appeals-formatter.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { generateCommentsSummaryList } from './page-components/common.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {string} finalCommentsType
 * @param {Representation} comment
 * @param {import('@pins/express').Session} session
 * @returns {PageContent}
 */
export function reviewFinalCommentsPage(appealDetails, finalCommentsType, comment, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const commentSummaryList = generateCommentsSummaryList(appealDetails.appealId, comment);

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
					text: 'Accept final comments',
					checked: comment?.status === COMMENT_STATUS.VALID
				},
				{
					value: COMMENT_STATUS.VALID_REQUIRES_REDACTION,
					text: 'Redact and accept final comments',
					checked: false // This status isn't persisted so will always be unchecked
				},
				{
					value: COMMENT_STATUS.INVALID,
					text: 'Reject final comments',
					checked:
						comment?.status === COMMENT_STATUS.INVALID ||
						(comment?.status === COMMENT_STATUS.AWAITING_REVIEW &&
							session.rejectFinalComment?.commentId === comment.id)
				}
			]
		}
	};

	const pageContent = {
		title: `Review ${finalCommentsType} final comments`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Review ${finalCommentsType} final comments`,
		headingClasses: 'govuk-heading-l',
		submitButtonText: 'Continue',
		pageComponents: [commentSummaryList, commentValidityRadioButtons]
	};

	return pageContent;
}

/**
 * @param {string} finalCommentsType
 * @returns {string}
 */
export function formatFinalCommentsTypeText(finalCommentsType) {
	return finalCommentsType === 'lpa' ? 'LPA' : 'appellant';
}
