import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { DOCUMENT_FOLDER_DISPLAY_LABELS } from '@pins/appeals/constants/documents.js';

/**
 * @param {Object} options
 * @param {string|undefined} options.folderPath
 * @param {boolean} [options.capitalise] if true, the first letter of the returned string will be converted to uppercase
 * @param {boolean} [options.removeTrailingDocumentsString] if true, if the display label ends with the string 'documents', this will be removed before returning
 * @returns {string|undefined}
 */
export function mapFolderNameToDisplayLabel({
	folderPath,
	capitalise = false,
	removeTrailingDocumentsString = false
}) {
	if (!folderPath || !folderPath.includes('/')) {
		return;
	}

	const documentType = folderPath.split('/')[1];

	if (documentType in DOCUMENT_FOLDER_DISPLAY_LABELS) {
		let label = DOCUMENT_FOLDER_DISPLAY_LABELS[documentType];

		if (capitalise) {
			label = capitalizeFirstLetter(label);
		}

		if (removeTrailingDocumentsString && label.endsWith('documents')) {
			label = label.slice(0, -9).trim();
		}

		return label;
	}
}
