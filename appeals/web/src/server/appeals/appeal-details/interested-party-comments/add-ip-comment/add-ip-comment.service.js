export const DOCUMENT_STAGE = 'representation';
export const DOCUMENT_TYPE = 'representationAttachments';

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @returns {Promise<number>}
 * */
export const getAttachmentsFolderId = async (apiClient, appealId) => {
	const folders = await apiClient
		.get(`appeals/${appealId}/document-folders?path=${DOCUMENT_STAGE}/${DOCUMENT_TYPE}`)
		.json();
	if (!(folders && folders.length > 0)) {
		throw new Error(`failed to find folder for appeal ID ${appealId}`);
	}

	return folders[0].folderId;
};
