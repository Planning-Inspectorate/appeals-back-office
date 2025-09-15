import { appealShortReference } from '#lib/appeals-formatter.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {string} proofOfEvidenceType
 * @returns {PageContent}
 */
export function incompleteProofOfEvidencePage(appealDetails, proofOfEvidenceType) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const pageContent = {
		heading: 'Why are the proof of evidence and witnesses incomplete?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/proof-of-evidence/${proofOfEvidenceType}`,
		preHeading: `Appeal ${shortReference}`,
		hint: 'Select all that apply.'
	};

	return pageContent;
}
