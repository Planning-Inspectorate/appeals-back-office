import appealRule6PartyRepository from '#repositories/appeal-rule-6-party.repository.js';
import logger from '#utils/logger.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';

/** @typedef {import('#db-client').ServiceUser} ServiceUser */

/**
 * @param {number} appealId
 * @param {ServiceUser} serviceUser
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
// eslint-disable-next-line no-unused-vars
const addRule6Party = async (appealId, serviceUser, azureAdUserId) => {
	try {
		await appealRule6PartyRepository.createAppealRule6Party({
			appealId,
			serviceUser
		});
	} catch (error) {
		logger.error(error, 'Failed to add rule 6 party');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

export { addRule6Party };
