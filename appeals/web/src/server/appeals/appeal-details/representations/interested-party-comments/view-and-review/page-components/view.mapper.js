import { appealShortReference } from '#lib/appeals-formatter.js';
import { mapNotificationBannersFromSession } from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { generateCommentSummaryList } from './common.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {import('express-session').Session} session
 * @returns {PageContent}
 */
export function viewInterestedPartyCommentPage(appealDetails, comment, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const commentSummaryList = generateCommentSummaryList(appealDetails.appealId, comment);
	const notificationBanners = mapNotificationBannersFromSession(
		session,
		'viewIpComment',
		appealDetails.appealId
	);

	let backLinkHash = '';
	switch (comment.status) {
		case APPEAL_REPRESENTATION_STATUS.INVALID:
			backLinkHash = `#${APPEAL_REPRESENTATION_STATUS.INVALID}`;
			break;
		case `${APPEAL_REPRESENTATION_STATUS.VALID}`:
			backLinkHash = `#${APPEAL_REPRESENTATION_STATUS.VALID}`;
			break;
		default:
			break;
	}

	const pageContent = {
		title: 'View comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments${backLinkHash}`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'View comment',
		pageComponents: [...notificationBanners, commentSummaryList]
	};

	preRenderPageComponents(pageContent.pageComponents);

	return pageContent;
}
