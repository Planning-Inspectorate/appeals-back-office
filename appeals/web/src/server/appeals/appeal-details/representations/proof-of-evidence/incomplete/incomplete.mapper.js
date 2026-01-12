import { appealShortReference } from '#lib/appeals-formatter.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {string} proofOfEvidenceType
 * @param {import('../proof-of-evidence.middleware.js').AppealRule6Party} rule6Party
 * @returns {PageContent}
 */
export function incompleteProofOfEvidencePage(appealDetails, proofOfEvidenceType, rule6Party) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const pageContent = {
		heading: 'Why are the proof of evidence and witnesses incomplete?',
		backLinkUrl: `/appeals-service/appeal-details/${
			appealDetails.appealId
		}/proof-of-evidence/${proofOfEvidenceType}${
			proofOfEvidenceType.toLowerCase() === 'rule-6-party' ? `/${rule6Party?.id}` : ''
		}`,
		preHeading: `Appeal ${shortReference}`,
		hint: 'Select all that apply.'
	};

	return pageContent;
}
