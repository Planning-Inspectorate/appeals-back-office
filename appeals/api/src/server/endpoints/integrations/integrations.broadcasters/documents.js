import pino from '#utils/logger.js';
import config from '#config/config.js';
import { messageMappers } from '../integrations.mappers.js';
import { producers } from '#infrastructure/topics.js';
import { eventClient } from '#infrastructure/event-client.js';
import { schemas, validateFromSchema } from '../integrations.validators.js';
import { databaseConnector } from '#utils/database-connector.js';
import { ODW_SYSTEM_ID } from '#endpoints/constants.js';

const entityInfo = {
	name: 'AppealDocumentMetadata'
};

export const broadcastDocument = async (
	/** @type {string} */ documentId,
	/** @type {string} */ updateType
) => {
	if (!config.serviceBusEnabled) {
		return false;
	}
	const document = await databaseConnector.document.findUnique({
		where: { guid: documentId },
		include: {
			case: {
				include: {
					appealType: true
				}
			},
			latestDocumentVersion: {
				include: {
					redactionStatus: true
				}
			}
		}
	});

	if (!document || !document.latestDocumentVersion) {
		return false;
	}

	const msg = messageMappers.mapDocument(document);

	if (msg) {
		const validationResult = await validateFromSchema(schemas.events.document, msg);
		if (validationResult !== true && validationResult.errors) {
			const errorDetails = validationResult.errors?.map(
				(e) => `${e.instancePath || '/'}: ${e.message}`
			);

			pino.error(`Error validating ${entityInfo.name} entity: ${errorDetails}`);
			return false;
		}

		const topic = producers.boDocument;
		const res = await eventClient.sendEvents(topic, [msg], updateType, {
			entityType: entityInfo.name,
			sourceSystem: ODW_SYSTEM_ID
		});

		if (res) {
			return true;
		}
	}

	return false;
};
