import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {import('#lib/dates.js').DayMonthYearHourMinute} inputData
 * @returns {Promise<{}>}
 */
export function changeInfrastructureLevyAdoptedDate(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	inputData
) {
	const formattedValue = dayMonthYearHourMinuteToISOString(inputData);

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			infrastructureLevyAdoptedDate: formattedValue
		}
	});
}
