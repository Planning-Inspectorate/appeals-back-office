import config from '#config/config.js';
import { eventClient } from '#infrastructure/event-client.js';
import { producers } from '#infrastructure/topics.js';
import { mapServiceUserEntity } from '#mappers/integration/map-service-user-entity.js';
import { databaseConnector } from '#utils/database-connector.js';
import pino from '#utils/logger.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { schemas, validateFromSchema } from '../integrations.validators.js';

/**
 *
 * @param {number} userId
 * @param {string} updateType
 * @param {string} roleName
 * @param {string} caseReference
 * @returns
 */
export const broadcastServiceUser = async (userId, updateType, roleName, caseReference) => {
	if (!config.serviceBusEnabled && config.NODE_ENV !== 'development') {
		return false;
	}

	const user = await getServiceUser(userId);

	if (!user) {
		pino.error(`Trying to broadcast info for service-user ${userId}, but it was not found.`);
		return false;
	}

	const msg = mapServiceUserEntity(user, roleName, caseReference);

	if (msg) {
		const validationResult = await validateFromSchema(schemas.events.serviceUser, msg);
		if (validationResult !== true && validationResult.errors) {
			const errorDetails = validationResult.errors?.map(
				(e) => `${e.instancePath || '/'}: ${e.message}`
			);

			pino.error(`Error validating service user: ${errorDetails[0]}`);
			return false;
		}

		const topic = producers.boServiceUser;
		const res = await eventClient.sendEvents(topic, [msg], updateType, {
			entityType: roleName,
			sourceSystem: ODW_SYSTEM_ID
		});

		if (res) {
			return true;
		}
	}

	return false;
};

/**
 *
 * @param {number} userId
 */
const getServiceUser = (userId) => {
	return databaseConnector.serviceUser.findUnique({
		where: { id: userId },
		include: { address: true }
	});
};

/** @typedef {Awaited<ReturnType<getServiceUser>>} GetServiceUser */
