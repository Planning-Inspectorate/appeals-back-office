import appealRepository from '#repositories/appeal.repository.js';

/**
 *
 * @param {Number} appealId
 * @param {Boolean} eiaScreeningRequired
 *
 * @returns {Promise<Boolean | null>}
 */

export const updateEiaScreeningRequirement = async (appealId, eiaScreeningRequired) => {
	const result = await appealRepository.setAppealEiaScreeningRequired(
		appealId,
		eiaScreeningRequired
	);

	return result?.eiaScreeningRequired || null;
};
