import { appealShortReference } from '#lib/appeals-formatter.js';
import { mapNotificationBannersFromSession } from '#lib/mappers/index.js';
import { isRepresentationReviewRequired } from '#lib/representation-utilities.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { generateCommentsSummaryList } from './page-components/common.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {string} finalCommentsType
 * @param {Representation} comment
 * @param {import('@pins/express').Session} session
 * @param {string | undefined} backUrl
 * @returns {PageContent}
 */
export function reviewFinalCommentsPage(
	appealDetails,
	finalCommentsType,
	comment,
	session,
	backUrl
) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const notificationBanners = mapNotificationBannersFromSession(
		session,
		'viewFinalComments',
		appealDetails.appealId
	);

	const reviewRequired = isRepresentationReviewRequired(comment.status);

	const commentSummaryList = generateCommentsSummaryList(
		appealDetails.appealId,
		comment,
		reviewRequired
	);

	const title = reviewRequired
		? `Review ${finalCommentsType} final comments`
		: `${capitalizeFirstLetter(finalCommentsType)} final comments`;

	const pageContent = {
		title,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: title,
		submitButtonText: 'Continue',
		pageComponents: [...notificationBanners, commentSummaryList]
	};

	if (reviewRequired) {
		pageContent.pageComponents.push({
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
					comment.originalRepresentation
						? {
								value: COMMENT_STATUS.VALID_REQUIRES_REDACTION,
								text: 'Redact and accept final comments',
								checked: false // This status isn't persisted so will always be unchecked
						  }
						: undefined,
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
		});
	}

	return pageContent;
}

/**
 * @param {string} finalCommentsType
 * @param {boolean} [capitaliseFirstLetter]
 * @returns {string}
 */
export function formatFinalCommentsTypeText(finalCommentsType, capitaliseFirstLetter = false) {
	return finalCommentsType === 'lpa' ? 'LPA' : `${capitaliseFirstLetter ? 'A' : 'a'}ppellant`;
}
