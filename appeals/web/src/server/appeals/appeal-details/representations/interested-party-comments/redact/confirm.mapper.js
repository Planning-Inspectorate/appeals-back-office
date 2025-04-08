/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';
import { summaryList } from './components/summary-list.js';

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageContent}
 */
export const confirmRedactInterestedPartyCommentPage = (appealDetails, comment, session) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const redactMatching = checkRedactedText(
		comment.originalRepresentation,
		session?.redactedRepresentation
	);
	/** @type {PageComponent[]} */
	const pageComponents = [summaryList(appealDetails, comment, session, redactMatching)];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Confirm redaction',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/redact`,
		preHeading: `Appeal ${shortReference}`,
		heading: redactMatching ? 'Check details and redact comment' : 'Check Details',
		forceRenderSubmitButton: true,
		submitButtonText: redactMatching ? 'Redact and accept comment' : 'Accept comment',
		pageComponents
	};

	return pageContent;
};
