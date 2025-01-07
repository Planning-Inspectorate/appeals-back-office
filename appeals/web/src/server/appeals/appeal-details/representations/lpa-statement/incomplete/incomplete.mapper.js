import { appealShortReference } from '#lib/appeals-formatter.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */

/**
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 */
export function rejectLpaStatementPage(appealDetails) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const pageContent = {
		heading: 'Why is the statement incomplete?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/incomplete/confirm`,
		preHeading: `Appeal ${shortReference}`,
		hint: 'Select all that apply.',
		headingClasses: 'govuk-heading-l'
	};

	return pageContent;
}
