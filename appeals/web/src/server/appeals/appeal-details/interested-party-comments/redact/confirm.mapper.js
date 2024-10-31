/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { summaryList } from './components/summary-list.js';

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageContent}
 */
export const confirmRedactInterestedPartyCommentPage = (appealDetails, comment, session) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent[]} */
	const pageComponents = [summaryList(appealDetails, comment, session)];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Confirm redaction',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/redact`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Redact comment from ${comment.author}`,
		headingClasses: 'govuk-heading-l',
		forceRenderSubmitButton: true,
		submitButtonText: 'Confirm redaction and accept comment',
		pageComponents
	};

	return pageContent;
};
