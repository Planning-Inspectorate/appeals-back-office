import { appealShortReference } from '#lib/appeals-formatter.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { generateCommentSummaryList, generateWithdrawLink } from './common.js';

/** @typedef {import("../../../../../appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../../../../../appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @returns {PageContent}
 */
export function reviewInterestedPartyCommentPage(appealDetails, comment) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const commentSummaryList = generateCommentSummaryList(comment, { isReviewPage: true });
	const withdrawLink = generateWithdrawLink();

	/** @type {PageComponent} */
	const siteVisitRequestCheckbox = {
		type: 'checkboxes',
		parameters: {
			name: 'site-visit-request',
			items: [
				{
					text: 'The comment includes a site visit request',
					value: 'site-visit',
					checked: comment?.siteVisitRequested
				}
			]
		}
	};

	/** @type {PageComponent} */
	const commentValidityRadioButtons = {
		type: 'radios',
		parameters: {
			name: 'status',
			fieldset: {
				legend: {
					text: 'Do you accept the comment?',
					isPageHeading: false,
					classes: 'govuk-fieldset__legend--m'
				}
			},
			items: [
				{
					value: 'valid',
					text: 'Comment valid',
					checked: comment?.status === COMMENT_STATUS.VALID
				},
				...[
					comment.source === 'citizen'
						? {
								value: 'valid_requires_redaction',
								text: 'Comment valid but requires redaction',
								checked: false // This status isn't persisted so will always be unchecked
						  }
						: null
				].filter(Boolean),
				{
					value: 'invalid',
					text: 'Comment invalid',
					checked: comment?.status === COMMENT_STATUS.INVALID
				}
			]
		}
	};

	const pageContent = {
		title: 'Review comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Review comment',
		headingClasses: 'govuk-heading-l',
		submitButtonText: 'Confirm',
		pageComponents: [
			commentSummaryList,
			siteVisitRequestCheckbox,
			commentValidityRadioButtons,
			withdrawLink
		]
	};

	return pageContent;
}
