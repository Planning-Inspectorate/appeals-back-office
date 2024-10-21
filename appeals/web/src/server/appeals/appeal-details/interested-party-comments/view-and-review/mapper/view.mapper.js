import { appealShortReference } from '#lib/appeals-formatter.js';
import { generateCommentSummaryList, generateWithdrawLink } from './common.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../../interested-party-comments.types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @returns {PageContent}
 */
export function viewInterestedPartyCommentPage(appealDetails, comment) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const commentSummaryList = generateCommentSummaryList(comment);
	const withdrawLink = generateWithdrawLink();

	const pageContent = {
		title: 'View comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'View comment',
		headingClasses: 'govuk-heading-l',
		pageComponents: [commentSummaryList, withdrawLink]
	};

	return pageContent;
}
