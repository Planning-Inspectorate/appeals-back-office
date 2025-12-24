import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealRule6PartyRepository from '#repositories/appeal-rule-6-party.repository.js';
import logger from '#utils/logger.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import { EventType } from '@pins/event-client';
import { SERVICE_USER_TYPE } from '@planning-inspectorate/data-model';

/** @typedef {import('#db-client/client.ts').Appeal} Appeal */
/** @typedef {import('#db-client/client.ts').ServiceUser} ServiceUser */
/** @typedef {import('#db-client/client.ts').AppealRule6Party} AppealRule6Party */
/**
 * @param {number} appealId
 * @param {string} appealReference
 * @param {ServiceUser} serviceUser
 * @param {string} azureAdUserId
 * @returns {Promise<{ appealId: number, id: number, serviceUserId: number }>}
 */
// eslint-disable-next-line no-unused-vars
const addRule6Party = async (appealId, appealReference, serviceUser, azureAdUserId) => {
	try {
		const result = await appealRule6PartyRepository.createAppealRule6Party({
			appealId,
			serviceUser
		});

		await broadcasters.broadcastServiceUser(
			result.serviceUserId,
			EventType.Create,
			SERVICE_USER_TYPE.RULE_6_PARTY,
			appealReference
		);

		return result;
	} catch (error) {
		logger.error(error, 'Failed to add rule 6 party');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {string} appealReference
 * @param {number} rule6PartyId
 * @param {ServiceUser} serviceUser
 * @param {string} azureAdUserId
 * @returns {Promise<{ appealId: number, id: number, serviceUserId: number }>}
 */
// eslint-disable-next-line no-unused-vars
const updateRule6Party = async (appealReference, rule6PartyId, serviceUser, azureAdUserId) => {
	try {
		const result = await appealRule6PartyRepository.updateRule6Party({ rule6PartyId, serviceUser });

		await broadcasters.broadcastServiceUser(
			result.serviceUserId,
			EventType.Update,
			SERVICE_USER_TYPE.RULE_6_PARTY,
			appealReference
		);

		return result;
	} catch (error) {
		logger.error(error, 'Failed to update rule 6 party');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {string} appealReference
 * @param {number} rule6PartyId
 * @param {string} azureAdUserId
 * @returns {Promise<{ appealId: number, id: number, serviceUserId: number }>}
 */
// eslint-disable-next-line no-unused-vars
const deleteRule6Party = async (appealReference, rule6PartyId, azureAdUserId) => {
	try {
		const result = await appealRule6PartyRepository.deleteRule6Party(rule6PartyId);

		await broadcasters.broadcastServiceUser(
			result.serviceUserId,
			EventType.Delete,
			SERVICE_USER_TYPE.RULE_6_PARTY,
			appealReference
		);
		return result;
	} catch (error) {
		logger.error(error, 'Failed to delete rule 6 party');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

export { addRule6Party, deleteRule6Party, updateRule6Party };
