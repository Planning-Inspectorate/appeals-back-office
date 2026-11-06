/**
 * @param {string} documentGuid
 * @param {string | null | undefined} originalFilename
 * @returns {string}
 */
export const createDocumentStorageFilename = (documentGuid, originalFilename) => {
	// can be used outside of node context, so can't use node path

	// get file name from path
	let filename = originalFilename?.split(/[\\/]/).pop() || '';

	// remove trailing dots and spaces from filename
	while (filename.endsWith('.') || filename.endsWith(' ')) {
		filename = filename.slice(0, -1);
	}

	// get extension from filename
	const lastDotIndex = filename.lastIndexOf('.');
	const extension =
		lastDotIndex > 0 && filename !== '.' && filename !== '..'
			? filename.slice(lastDotIndex).toLowerCase()
			: '';

	// validate extension format
	if (!/^\.[a-z0-9_-]+$/.test(extension)) {
		return documentGuid;
	}

	return `${documentGuid}${extension}`;
};
