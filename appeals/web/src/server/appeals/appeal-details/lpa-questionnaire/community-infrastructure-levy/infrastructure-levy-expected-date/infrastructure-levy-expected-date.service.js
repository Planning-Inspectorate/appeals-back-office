import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {import('#lib/dates.js').DayMonthYearHourMinute} inputData
 * @returns {Promise<{}>}
 */
export function changeInfrastructureLevyExpectedDate(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	inputData
) {
	const formattedValue = dayMonthYearHourMinuteToISOString(inputData);

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			infrastructureLevyExpectedDate: formattedValue
		}
	});
}
