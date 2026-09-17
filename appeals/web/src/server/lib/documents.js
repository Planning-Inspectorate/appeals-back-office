import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';

/**
 * @param {string} folderPath
 * @returns {boolean}
 */
export function folderIsAdditionalDocuments(folderPath) {
	const documentType = folderPath.split('/')[1];
	return (
		documentType === APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_CORRESPONDENCE ||
		documentType === APPEAL_DOCUMENT_TYPE.LPA_CASE_CORRESPONDENCE
	);
}

/** @type {string[]} */
const supportingHearingInquiryInquiryEventDocType = [
	APPEAL_DOCUMENT_TYPE.GENERAL_SUPPORTING,
	APPEAL_DOCUMENT_TYPE.HEARING_PROCESS,
	APPEAL_DOCUMENT_TYPE.INQUIRY_CORE,
	APPEAL_DOCUMENT_TYPE.INQUIRY_POST_EVENT
];
/**
 *
 * @param {Object} params
 * @param {string} params.costsDocumentType
 * @param {string | undefined} params.latestVersionDocumentType
 * @returns {string}
 */
export function getUrlSuffix({ costsDocumentType, latestVersionDocumentType }) {
	// costsDocumentType is for costs and latestVersionDocument is for checking if
	// the document type is supporting, inquiry, inquiry event or hearing
	if (costsDocumentType === 'withdrawal') return '/check-your-answers';
	if (
		latestVersionDocumentType &&
		supportingHearingInquiryInquiryEventDocType.includes(latestVersionDocumentType)
	)
		return '/invite-main-party-comments';
	return '/invite-responses';
}
