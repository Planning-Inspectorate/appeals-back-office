import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} inputData
 * @returns {Promise<{}>}
 */
export function changeSpecialControlOfAdvertisment(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	inputData
) {
	const formattedValue = convertFromYesNoToBoolean(inputData);

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			isSiteInAreaOfSpecialControlAdverts: formattedValue
		}
	});
}
