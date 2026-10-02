import Path from 'node:path';

/**
 * @param {string} documentGuid
 * @param {string | null | undefined} originalFilename
 * @returns {string}
 */
export const createDocumentStorageFilename = (documentGuid, originalFilename) => {
	const extension = Path.extname(originalFilename || '');
	return `${documentGuid}${extension.toLowerCase()}`.trim();
};
