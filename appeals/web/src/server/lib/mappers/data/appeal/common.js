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

	let html = '';

	if (virusCheckStatus.checked) {
		if (virusCheckStatus.safe) {
			const { decision } = appealDetails;

			html = `<a class="govuk-link" href="${
				decision?.documentId && decision?.documentName
					? mapDocumentDownloadUrl(
							appealDetails.appealId,
							decision?.documentId,
							decision?.documentName
					  )
					: '#'
			}" target="_blank">${linkText}</a>`;
		} else {
			html = '<strong class="govuk-tag govuk-tag--red single-line">Virus detected</strong>';
		}
	} else {
		html = '<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong>';
	}

	return html;
}

/**
 * @param {string | undefined} lpaQStatus
 * @returns {boolean}
 */
export function shouldDisplayChangeLinksForLPAQStatus(lpaQStatus) {
	return !lpaQStatus || lpaQStatus !== 'not_received';
}
