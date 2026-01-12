import { getAttachmentList } from '#appeals/appeal-details/representations/common/document-attachment-list.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { formatProofOfEvidenceTypeText } from '../view-and-review/view-and-review.mapper.js';
import { summaryList } from './components/summary-list.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} representation
 * @param {string} proofOfEvidenceType
 * @param {import('../proof-of-evidence.middleware.js').AppealRule6Party} rule6Party
 * @returns {PageContent}
 */
export const confirmAcceptProofOfEvidencePage = (
	appealDetails,
	representation,
	proofOfEvidenceType,
	rule6Party
) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const attachmentsList = getAttachmentList(representation);

	/** @type {PageComponent[]} */
	const pageComponents = [
		summaryList(appealDetails, representation, proofOfEvidenceType, attachmentsList, rule6Party)
	];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: `Check details and accept ${formatProofOfEvidenceTypeText(
			proofOfEvidenceType,
			false,
			rule6Party?.serviceUser?.organisationName ?? ''
		)} proof of evidence and witnesses`,
		backLinkUrl: `/appeals-service/appeal-details/${
			appealDetails.appealId
		}/proof-of-evidence/${proofOfEvidenceType}${
			proofOfEvidenceType.toLowerCase() === 'rule-6-party' ? `/${rule6Party?.id}` : ''
		}`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Check details and accept ${formatProofOfEvidenceTypeText(
			proofOfEvidenceType,
			false,
			rule6Party?.serviceUser?.organisationName ?? ''
		)} proof of evidence and witnesses`,
		forceRenderSubmitButton: true,
		submitButtonText: `Accept ${formatProofOfEvidenceTypeText(
			proofOfEvidenceType,
			false,
			rule6Party?.serviceUser?.organisationName ?? ''
		)} proof of evidence and witnesses`,
		pageComponents
	};

	return pageContent;
};
