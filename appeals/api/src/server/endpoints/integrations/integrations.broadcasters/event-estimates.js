import config from '#config/config.js';
import { eventClient } from '#infrastructure/event-client.js';
import { producers } from '#infrastructure/topics.js';
import { mapHearingEstimateEntity } from '#mappers/integration/map-event-estimates-entity.js';
import { databaseConnector } from '#utils/database-connector.js';
import pino from '#utils/logger.js';
import { EVENT_TYPE, ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { EventType } from '@pins/event-client';
import { schemas, validateFromSchema } from '../integrations.validators.js';
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealEventEstimate} AppealEventEstimate */
/** @typedef {import('@pins/appeals.api').Schema.HearingEstimate} HearingEstimate */

/**
 *
 * @param {number} eventId
 * @param {string} eventType
 * @param {string} updateType
 * @param {HearingEstimate | undefined | null} existingHearingEstimate
 * @returns
 */
export const broadcastEventEstimates = async (
	eventId,
	eventType,
	updateType,
	existingHearingEstimate
) => {
	if (!config.serviceBusEnabled && config.NODE_ENV !== 'development') {
		return false;
	}
	/** @type { AppealEventEstimate | undefined } */
	let msg = undefined;

	if (eventType === EVENT_TYPE.HEARING) {
		let hearingEstimate = await databaseConnector.hearingEstimate.findUnique({
			where: { id: eventId },
			include: {
				appeal: true
			}
		});

		if (!hearingEstimate && updateType !== EventType.Delete) {
			pino.error(
				`Trying to broadcast info for event ${eventId} of type ${eventType}, but hearing estimates was not found.`
			);
			return false;
		}

		// Handling Cancellation and deletion of hearing
		if (updateType === EventType.Delete && existingHearingEstimate) {
			const appeal = await databaseConnector.appeal.findUnique({
				where: { id: existingHearingEstimate.appealId }
			});

			if (!appeal) {
				pino.error(
					`Trying to broadcast info for event ${eventId} of type ${eventType}, no appeal was found.`
				);
				return false;
			}

			hearingEstimate = {
				id: eventId,
				// @ts-ignore
				appeal: {
					reference: appeal.reference
				},
				preparationTime: null,
				sittingTime: null,
				eportingTime: null
			};
		}

		// @ts-ignore
		msg = mapHearingEstimateEntity(hearingEstimate);
	}

	if (msg) {
		const validationResult = await validateFromSchema(schemas.events.appealEventEstimate, msg);
		if (validationResult !== true && validationResult.errors) {
			const errorDetails = validationResult.errors?.map(
				(e) => `${e.instancePath || '/'}: ${e.message}`
			);

			pino.error(`Error validating ${eventType} entity: ${errorDetails}`);
			return false;
		}

		const topic = producers.boEventEstimate;
		const res = await eventClient.sendEvents(topic, [msg], updateType, {
			entityType: eventType,
			sourceSystem: ODW_SYSTEM_ID
		});

		if (res) {
			return true;
		}
	}

	return false;
};
