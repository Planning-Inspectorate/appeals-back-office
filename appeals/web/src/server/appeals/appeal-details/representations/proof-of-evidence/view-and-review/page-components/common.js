import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';

/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * Maps representation types to their respective URL path fragments.
 * @param {string} representationType
 * @returns {string}
 */
function mapRepresentationTypeToPath(representationType) {
	switch (representationType) {
		case APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE:
			return 'appellant';
		case APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE:
			return 'lpa';
		default:
			throw new Error(`Unsupported representation type: ${representationType}`);
	}
}

/**
 * Generates the proof of evidence summary list used in both view and review pages.
 * @param {number} appealId
 * @param {Representation} proofOfEvidence - The representation object.
 * @returns {PageComponent} The generated proof of evidence summary list component.
 */
export function generateProofOfEvidenceSummaryList(appealId, proofOfEvidence) {
	const filteredAttachments = proofOfEvidence.attachments?.filter((attachment) => {
		const { isDeleted, latestVersionId } = attachment?.documentVersion?.document ?? {};
		return latestVersionId === attachment.version && !isDeleted;
	});

	const attachmentsList = filteredAttachments?.length
		? buildHtmlList({
				items: filteredAttachments.map(
					(a) =>
						`<a class="govuk-link" href="${mapDocumentDownloadUrl(
							a.documentVersion.document.caseId,
							a.documentVersion.document.guid,
							a.documentVersion.document.name
						)}" target="_blank">${a.documentVersion.document.name}</a>`
				),
				isOrderedList: true,
				isNumberedList: filteredAttachments.length > 1
		  })
		: null;

	const proofOfEvidenceTypePath = mapRepresentationTypeToPath(proofOfEvidence.representationType);
	const rows = [
		{
			key: { text: 'Proof of evidence and witnesses' },
			value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' },
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceTypePath}/change/${proofOfEvidence.attachments?.[0]?.documentVersion?.document?.folderId}`,
						visuallyHiddenText: 'proof of evidence and witnesses'
					}
				]
			}
		}
	];

	/** @type {PageComponent} */
	const summaryList = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: { rows }
	};

	preRenderPageComponents([summaryList]);

	return summaryList;
}
