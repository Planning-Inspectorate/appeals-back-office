/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentsId
 * */
export const getFinalComments = (apiClient, appealId, commentsId) =>
	apiClient.get(`appeals/${appealId}/reps/${commentsId}`).json();

export const DOCUMENT_STAGE = 'representation';
export const DOCUMENT_TYPE = 'representationAttachments';

/**
 * @param {import('got').Got} apiClient
 * @param {number | string} appealId
 * @returns {Promise<import('@pins/appeals.api').Appeals.FolderInfo>}
 * */
export const getAttachmentsFolder = async (apiClient, appealId) => {
	const folders = await apiClient
		.get(`appeals/${appealId}/document-folders?path=${DOCUMENT_STAGE}/${DOCUMENT_TYPE}`)
		.json();
	if (!(folders && folders.length > 0)) {
		throw new Error(`failed to find folder for appeal ID ${appealId}`);
	}

	return folders[0];
};
