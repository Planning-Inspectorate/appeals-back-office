import appealRepository from '#repositories/appeal.repository.js';

/**
 * @param {Boolean} eiaScreeningRequired
 * @param {Number[]} appealIds
 *
 */
export const updateEiaScreeningRequirement = async (eiaScreeningRequired, appealIds) => {
	const result = await appealRepository.setMultiAppealEiaScreeningRequired(
		appealIds,
		eiaScreeningRequired
	);
	return result;
};
