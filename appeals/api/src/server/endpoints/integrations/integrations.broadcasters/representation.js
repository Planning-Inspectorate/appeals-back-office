import config from '#config/config.js';
import { eventClient } from '#infrastructure/event-client.js';
import { producers } from '#infrastructure/topics.js';
import { mapRepresentationEntity } from '#mappers/integration/map-representation-entity.js';
import { databaseConnector } from '#utils/database-connector.js';
import pino from '#utils/logger.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { schemas, validateFromSchema } from '../integrations.validators.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 *
 * @param {number} representationId
 * @param {string} updateType
 * @returns
 */
export const broadcastRepresentation = async (representationId, updateType) => {
	if (!config.serviceBusEnabled && config.NODE_ENV !== 'development') {
		return false;
	}

	const rep = await databaseConnector.representation.findUnique({
		where: { id: representationId },
		include: {
			appeal: true,
			lpa: true,
			representationRejectionReasonsSelected: {
				include: {
					representationRejectionReason: true,
					representationRejectionReasonText: true
				}
			},
			attachments: true
		}
	});

	if (!rep || rep === null) {
		pino.error(
			`Trying to broadcast info for appeal-representation ${representationId}, but it was not found.`
		);
		return false;
	}

	// @ts-ignore
	const msg = mapRepresentationEntity(rep);

	if (msg) {
		const validationResult = await validateFromSchema(schemas.events.appealRepresentation, msg);
		if (validationResult !== true && validationResult.errors) {
			const errorDetails = validationResult.errors?.map(
				(e) => `${e.instancePath || '/'}: ${e.message}`
			);

			pino.error(`Error validating representation: ${errorDetails[0]}`);
			return false;
		}

		const topic = producers.boRepresentation;
		const res = await eventClient.sendEvents(topic, [msg], updateType, {
			entityType: `appeal_representation_${rep.representationType}`,
			sourceSystem: ODW_SYSTEM_ID
		});

		if (res) {
			return true;
		}
	}

	return false;
};
