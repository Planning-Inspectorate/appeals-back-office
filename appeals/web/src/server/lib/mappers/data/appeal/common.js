import {
	mapDocumentDownloadUrl,
	mapVirusCheckStatus
} from '#appeals/appeal-documents/appeal-documents.mapper.js';
import {
	dateIsInThePast,
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate
} from '#lib/dates.js';
import {
	APPEAL_PROOF_OF_EVIDENCE_STATUS,
	APPEAL_REPRESENTATION_STATUS
} from '@pins/appeals/constants/common.js';
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

/**
 * @param {WebAppeal} appealDetails
 * @param {string} [status]
 * @param {string | null} [representationStatus]
 * @param {boolean} [isRedacted]
 * @returns {string}
 */
export const statementStatusText = (appealDetails, status, representationStatus, isRedacted) => {
	if (!appealDetails.startedAt) {
		return 'Awaiting start date';
	}

	if (status === 'not_received') {
		return appealDetails.appealTimetable?.lpaStatementDueDate &&
			dateIsInThePast(
				dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.lpaStatementDueDate)
			)
			? 'Overdue'
			: 'Awaiting statement';
	}

	switch (representationStatus?.toLowerCase()) {
		case 'awaiting_review':
			return 'Ready to review';
		case 'valid':
			return isRedacted ? 'Redacted and accepted' : 'Accepted';
		case 'incomplete':
			return 'Incomplete';
		case 'published':
			return 'Shared';
		default:
			return '';
	}
};

/**
 * @param {WebAppeal} appealDetails
 * @param {{status: string, receivedAt?: string | Date | null} | undefined} statement
 * @returns {string}
 */
export const statementReceivedText = (appealDetails, statement) => {
	if (!appealDetails.startedAt) {
		return 'Not applicable';
	}

	if (statement?.status === 'not_received') {
		return `Due by ${dateISOStringToDisplayDate(
			appealDetails.appealTimetable?.lpaStatementDueDate
		)}`;
	}

	const receivedAt =
		statement?.receivedAt instanceof Date
			? statement.receivedAt.toDateString()
			: statement?.receivedAt;

	return dateISOStringToDisplayDate(receivedAt);
};

/**
 * @param {string | undefined} status
 * @param {string | null | undefined} representationStatus
 * @returns {string}
 */
export const proofsStatusText = (status, representationStatus) => {
	if (representationStatus?.toLowerCase() === APPEAL_REPRESENTATION_STATUS.VALID) {
		return 'Completed';
	} else if (representationStatus?.toLowerCase() === APPEAL_REPRESENTATION_STATUS.INCOMPLETE) {
		return 'Incomplete';
	} else {
		return status && status.toLowerCase() === APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED
			? APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED
			: 'Awaiting proof of evidence and witness';
	}
};

/**
 * @param {string} statusText
 * @param {string | Date | null | undefined} receivedAt
 * @returns {string}
 */
export const proofsReceivedText = (statusText, receivedAt) => {
	if (statusText === 'Awaiting proof of evidence and witness') {
		return '';
	}

	return dateISOStringToDisplayDate(
		receivedAt instanceof Date ? receivedAt.toDateString() : receivedAt
	);
};
