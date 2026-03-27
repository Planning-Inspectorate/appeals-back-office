import logger from '#lib/logger.js';

/**
 * Map an incoming proofOfEvidenceType string to a trusted representation type path segment.
 * Throws an error if the type is not recognised.
 *
 * @param {string} proofOfEvidenceType
 * @returns {string}
 */
function mapProofOfEvidenceTypeToRepType(proofOfEvidenceType) {
	const normalisedType = String(proofOfEvidenceType).trim();

	/** @type {Record<string, string>} */
	const allowedTypes = {
		lpa: 'lpa',
		appellant: 'appellant',
		'rule-6-party': 'rule-6-party'
	};

	const repType = allowedTypes[normalisedType];
	if (!repType) {
		throw new Error(`Invalid proofOfEvidenceType value: ${proofOfEvidenceType}`);
	}

	return repType;
}

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {string} proofOfEvidenceType
 * @param {object} payload
 * @param {string[]} payload.attachments
 * @param {number} [payload.representedId]
 * @param {string} proofOfEvidenceType
 * @returns {Promise<any>}
 */
export async function postRepresentationProofOfEvidence(
	apiClient,
	appealId,
	payload,
	proofOfEvidenceType
) {
	try {
		const repType = mapProofOfEvidenceTypeToRepType(proofOfEvidenceType);

		const response = await apiClient.post(`appeals/${appealId}/reps/${repType}/proof-of-evidence`, {
			json: payload
		});
		return response.body;
	} catch (error) {
		logger.error('Error posting proof of evidence:', error);
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
