import { APPEAL_START_RANGE } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {number} id
 * @returns {string}
 */
export const createAppealReference = (id) => {
	const minref = APPEAL_START_RANGE;
	if (id > minref) {
		return id.toString();
	}

	return (minref + id).toString();
};
