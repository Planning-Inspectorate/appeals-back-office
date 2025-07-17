import {
	mapDocumentDownloadUrl,
	mapVirusCheckStatus
} from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { APPEAL_VIRUS_CHECK_STATUS } from '@planning-inspectorate/data-model';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */
/**
 * @typedef {{folderId: number, invalidReason?: string | null, documentId?: string | null,
 * documentName?: string | null, letterDate?: string | null, outcome?: string | null,
 * virusCheckStatus?: string | null}} Decision
 * */

/**
 * @param {WebAppeal} appealDetails
 * @param {string} [linkText]
 * @returns {string}
 */
export function generateDecisionDocumentDownloadHtml(appealDetails, linkText = 'View') {
	const virusCheckStatus = mapVirusCheckStatus(
		appealDetails.decision.virusCheckStatus || APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
	);

	if (!virusCheckStatus.checked) {
		return '<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong>';
	}

	if (!virusCheckStatus.safe) {
		return '<strong class="govuk-tag govuk-tag--red">Virus detected</strong>';
	}

	return buildDecisionDocumentLinkHtml(appealDetails.appealId, appealDetails?.decision, linkText);
}

/**
 * @param {string | undefined} lpaQStatus
 * @returns {boolean}
 */
export const shouldDisplayChangeLinksForLPAQStatus = (lpaQStatus) =>
	!lpaQStatus || lpaQStatus !== 'not_received';

/**
 * @param {number} appealId
 * @param {Decision} decision
 * @param {string} linkText
 * @returns {string}
 */
export const buildDecisionDocumentLinkHtml = (appealId, decision, linkText) => {
	return `<a class="govuk-link" href="${
		decision?.documentId && decision?.documentName
			? mapDocumentDownloadUrl(appealId, decision.documentId, decision.documentName)
			: '#'
	}" target="_blank">${linkText}</a>`;
};
