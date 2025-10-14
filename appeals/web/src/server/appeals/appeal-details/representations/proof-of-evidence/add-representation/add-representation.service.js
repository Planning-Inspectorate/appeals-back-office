/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {string[]} documentGUIDs
 * @param {string} proofOfEvidenceType
 * @returns {Promise<any>}
 */
export async function postRepresentationProofOfEvidence(
	apiClient,
	appealId,
	documentGUIDs,
	proofOfEvidenceType
) {
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
		console.error('Error posting proof of evidence:', error);
		throw new Error('Failed to post proof of evidence representation');
	}
}

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
