import logger from '#lib/logger.js';
import {
	assertValidNumericIds,
	assertValidProofOfEvidenceType
} from '#lib/validators/api-parameters.validator.js';

export const DOCUMENT_STAGE = 'representation';
export const DOCUMENT_TYPE = 'representationAttachments';

/**
 * @param {import('got').Got} apiClient
 * @param {number | string} appealId
 * @returns {Promise<import('@pins/appeals.api').Appeals.FolderInfo>}
 * */
export const getAttachmentsFolder = async (apiClient, appealId) => {
	const ids = assertValidNumericIds({ appealId });
	const folders = await apiClient
		.get(`appeals/${ids.appealId}/document-folders?path=${DOCUMENT_STAGE}/${DOCUMENT_TYPE}`)
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
	const ids = assertValidNumericIds({ appealId, repId });
	return apiClient
		.patch(`appeals/${ids.appealId}/reps/${repId}/attachments`, {
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
		const ids = assertValidNumericIds({ appealId });
		const types = assertValidProofOfEvidenceType({ proofOfEvidenceType });
		const response = await apiClient.post(
			`appeals/${ids.appealId}/reps/${types.proofOfEvidenceType}/proof-of-evidence`,
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
