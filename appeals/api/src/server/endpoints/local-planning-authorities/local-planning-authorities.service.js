import lpaRepository from '#repositories/lpa.repository.js';

/**
 *
 * @param {number} lpaId
 * @returns {Promise<object | null>}
 */
const getLpa = async (lpaId) => {
	const result = await lpaRepository.getLpaById(lpaId);
	return result;
};

export const lpaService = {
	getLpa
};
