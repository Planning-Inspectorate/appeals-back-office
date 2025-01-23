import { appealShortReference } from '#lib/appeals-formatter.js';
import { buildNotificationBanners } from '#lib/mappers/index.js';
import { generateCommentSummaryList, generateWithdrawLink } from './common.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';

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
	const withdrawLink = generateWithdrawLink();
	const notificationBanners = buildNotificationBanners(
		session,
		'viewIpComment',
		appealDetails.appealId
	);

	const pageContent = {
		title: 'View comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'View comment',
		headingClasses: 'govuk-heading-l',
		pageComponents: [...notificationBanners, commentSummaryList, withdrawLink]
	};

	preRenderPageComponents(pageContent.pageComponents);

	return pageContent;
}
