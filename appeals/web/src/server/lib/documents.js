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
