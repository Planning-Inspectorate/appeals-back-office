import pino from '#utils/logger.js';
import config from '#config/config.js';
import { producers } from '#infrastructure/topics.js';
import { eventClient } from '#infrastructure/event-client.js';
import { schemas, validateFromSchema } from '../integrations.validators.js';
import { databaseConnector } from '#utils/database-connector.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { mapServiceUserEntity } from '#mappers/integration/map-service-user-entity.js';

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
	const user = await databaseConnector.serviceUser.findUnique({
		where: { id: userId }
	});

	if (!user) {
		pino.error(`Trying to broadcast info for service-user ${userId}, but it was not found.`);
		return false;
	}

	let userAddress;
	if (user.addressId) {
		userAddress = await databaseConnector.address.findUnique({
			where: { id: user.addressId }
		});
		if (!userAddress) {
			userAddress = undefined;
		}
	}

	const msg = mapServiceUserEntity(user, userAddress, roleName, caseReference);

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
