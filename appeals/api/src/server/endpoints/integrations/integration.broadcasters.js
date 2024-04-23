import pino from '#utils/logger.js';
import config from '#config/config.js';
import { mapServiceUser } from './integrations.mappers/index.js';
import { producers } from '#infrastructure/topics.js';
import { eventClient } from '#infrastructure/event-client.js';
import { schemas, validateFromSchema } from './integrations.validators.js';
import { databaseConnector } from '#utils/database-connector.js';
import { ODW_SYSTEM_ID } from '#endpoints/constants.js';

export const broadcastServiceUser = async (
	/** @type {Number} */ userId,
	/** @type {string} */ updateType,
	/** @type {string} */ roleName,
	/** @type {string} */ caseReference
) => {
	if (!config.serviceBusEnabled) {
		return false;
	}
	const user = await databaseConnector.serviceUser.findUnique({
		where: { id: userId }
	});

	if (!user) {
		return false;
	}

	const msg = mapServiceUser(caseReference, user, roleName);

	if (msg) {
		const validationResult = await validateFromSchema(schemas.serviceUser, msg);
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
