import { getAttachmentList } from '#appeals/appeal-details/representations/common/document-attachment-list.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { summaryList } from './components/summary-list.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} representation
 * @param {string} proofOfEvidenceType
 * @returns {PageContent}
 */
export const confirmAcceptProofOfEvidencePage = (
	appealDetails,
	representation,
	proofOfEvidenceType
) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const attachmentsList = getAttachmentList(representation);

	/** @type {PageComponent[]} */
	const pageComponents = [
		summaryList(appealDetails, representation, proofOfEvidenceType, attachmentsList)
	];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: `Check details and accept ${formatProofOfEvidenceTypeText(
			formatProofOfEvidenceTypeText(proofOfEvidenceType)
		)} proof of evidence and witnesses`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/proof-of-evidence/${proofOfEvidenceType}`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Check details and accept ${formatProofOfEvidenceTypeText(
			formatProofOfEvidenceTypeText(proofOfEvidenceType)
		)} proof of evidence and witnesses`,
		forceRenderSubmitButton: true,
		submitButtonText: `Accept ${formatProofOfEvidenceTypeText(
			formatProofOfEvidenceTypeText(proofOfEvidenceType)
		)} proof of evidence and witnesses`,
		pageComponents
	};

	return pageContent;
};

/**
 * @param {string} proofOfEvidenceType
 * @returns {string}
 */
function formatProofOfEvidenceTypeText(proofOfEvidenceType) {
	return proofOfEvidenceType === 'lpa' ? 'LPA' : 'appellant';
}
