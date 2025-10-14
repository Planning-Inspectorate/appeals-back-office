import logger from '#lib/logger.js';

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

/**
 * @param {import('got').Got} apiClient
 * @param {number | string} appealId
 * @param {number} repId
 * @param {string[]} documentGUIDs
 * @returns {Promise<import('@pins/appeals.api').Appeals.FolderInfo>}
 * */
export const patchRepresentationAttachments = async (apiClient, appealId, repId, documentGUIDs) => {
	return apiClient
		.patch(`appeals/${appealId}/reps/${repId}/attachments`, {
			json: {
				attachments: documentGUIDs
			}
		})
		.json();
};

/**
 * @param {import('got').Got} apiClient
 * @param {number | string} appealId
 * @param {string[]} documentGUIDs
 * @param {string} proofOfEvidenceType
 * @returns {Promise<any>}
 * */
export const postRepresentationProofOfEvidence = async (
	apiClient,
	appealId,
	documentGUIDs,
	proofOfEvidenceType
) => {
	try {
		const response = await apiClient.post(
			`appeals/${appealId}/reps/${proofOfEvidenceType}/proof-of-evidence`,
			{
				json: {
					attachments: documentGUIDs
				}
			}
		);
		return response.body;
	} catch (error) {
		logger.error('Error posting representation proof of evidence:', error);
		throw new Error('Failed to post representation proof of evidence');
	}
};
