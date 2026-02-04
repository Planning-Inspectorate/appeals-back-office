import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';

/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * Maps representation types to their respective URL path fragments.
 * @param {string} representationType
 * @param {import('../../proof-of-evidence.middleware.js').AppealRule6Party} rule6Party
 * @returns {string}
 */
function mapRepresentationTypeToPath(representationType, rule6Party) {
	switch (representationType) {
		case APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE:
			return 'appellant';
		case APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE:
			return 'lpa';
		case APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE:
			return `rule-6-party/${rule6Party.id}`;
		default:
			throw new Error(`Unsupported representation type: ${representationType}`);
	}
}

/**
 * Generates the proof of evidence summary list used in both view and review pages.
 * @param {number} appealId
 * @param {Representation} proofOfEvidence - The representation object.
 * @param {import('../../proof-of-evidence.middleware.js').AppealRule6Party} rule6Party
 * @returns {PageComponent} The generated proof of evidence summary list component.
 */
export function generateProofOfEvidenceSummaryList(appealId, proofOfEvidence, rule6Party) {
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

	const proofOfEvidenceTypePath = mapRepresentationTypeToPath(
		proofOfEvidence.representationType,
		rule6Party
	);
	const rows = [
		{
			key: { text: 'Proof of evidence and witnesses' },
			value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' },
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceTypePath}/manage-documents/${proofOfEvidence.attachments?.[0]?.documentVersion?.document?.folderId}?backUrl=/proof-of-evidence/${proofOfEvidenceTypePath}`,
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
