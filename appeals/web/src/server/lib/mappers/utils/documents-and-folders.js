import { DOCUMENT_FOLDER_DISPLAY_LABELS } from '@pins/appeals/constants/documents.js';

/**
 * @param {string|undefined} folderPath
 * @returns {string|undefined}
 */
export function mapFolderNameToDisplayLabel(folderPath) {
	if (!folderPath || !folderPath.includes('/')) {
		return;
	}

	const documentType = folderPath.split('/')[1];

	if (documentType in DOCUMENT_FOLDER_DISPLAY_LABELS) {
		return DOCUMENT_FOLDER_DISPLAY_LABELS[documentType];
	}
}
