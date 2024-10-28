import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { form } from './components/form/index.js';
import { instructionsList } from './components/instructions-list.js';
import { subtitle } from './components/subtitle.js';

/** @typedef {import("../../../../appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../../../../appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @returns {PageContent}
 */
export const redactInterestedPartyCommentPage = (appealDetails, comment) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent[]} */
	const pageComponents = [subtitle, instructionsList, form(comment)];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Redact comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/${comment.id}/review`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Redact comment from ${comment.author}`,
		headingClasses: 'govuk-heading-l',
		pageComponents
	};

	return pageContent;
};
