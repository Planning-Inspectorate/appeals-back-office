/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {string[]} documentGUIDs
 * @param {string} proofOfEvidenceType
 * @param {string|number} [representedId]
 * @returns {Promise<any>}
 */
export async function postRepresentationProofOfEvidence(
	apiClient,
	appealId,
	documentGUIDs,
	proofOfEvidenceType,
	representedId
) {
	try {
		/** @type {any} */
		const payload = { attachments: documentGUIDs };
		if (representedId) {
			payload.representedId = Number(representedId);
		}
		const repType =
			proofOfEvidenceType === 'rule-6-party' ? 'rule_6_party_proofs_evidence' : proofOfEvidenceType;

		const response = await apiClient.post(`appeals/${appealId}/reps/${repType}/proof-of-evidence`, {
			json: payload
		});
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
