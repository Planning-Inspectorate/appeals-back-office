import {
	mapDocumentDownloadUrl,
	mapVirusCheckStatus
} from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

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

	const { decision } = appealDetails;

	return `<a class="govuk-link" href="${
		decision?.documentId && decision?.documentName
			? mapDocumentDownloadUrl(appealDetails.appealId, decision?.documentId, decision?.documentName)
			: '#'
	}" target="_blank">${linkText}</a>`;
}

/**
 * @param {string | undefined} lpaQStatus
 * @returns {boolean}
 */
export const shouldDisplayChangeLinksForLPAQStatus = (lpaQStatus) =>
	!lpaQStatus || lpaQStatus !== 'not_received';
