import pino from '#utils/logger.js';
import config from '#config/config.js';
import { producers } from '#infrastructure/topics.js';
import { eventClient } from '#infrastructure/event-client.js';
import { schemas, validateFromSchema } from '../integrations.validators.js';
import { databaseConnector } from '#utils/database-connector.js';
import { ODW_SYSTEM_ID, EVENT_TYPE } from '@pins/appeals/constants/common.js';
import { mapSiteVisitEntity, mapHearingEntity } from '#mappers/integration/map-event-entity.js';
import { EventType } from '@pins/event-client';
/** @typedef {import('pins-data-model').Schemas.AppealEvent} AppealEvent */
/** @typedef {import('@pins/appeals.api').Schema.Hearing} Hearing */

/**
 *
 * @param {number} eventId
 * @param {string} eventType
 * @param {string} updateType
 * @param {Hearing | undefined | null} existingHearing
 * @returns
 */
export const broadcastEvent = async (
	eventId,
	eventType,
	updateType,
	existingHearing = undefined
) => {
	if (!config.serviceBusEnabled && config.NODE_ENV !== 'development') {
		return false;
	}
	/** @type { AppealEvent | undefined } */
	let msg = undefined;

	if (eventType === EVENT_TYPE.SITE_VISIT) {
		const siteVisit = await databaseConnector.siteVisit.findUnique({
			where: { id: eventId },
			include: {
				siteVisitType: true,
				appeal: {
					include: {
						address: true
					}
				}
			}
		});

		if (!siteVisit) {
			pino.error(
				`Trying to broadcast info for event ${eventId} of type ${eventType}, but it was not found.`
			);
			return false;
		}

		// @ts-ignore
		msg = mapSiteVisitEntity(siteVisit);
	}

	if (eventType === EVENT_TYPE.HEARING) {
		let hearing = await databaseConnector.hearing.findUnique({
			where: { id: eventId },
			include: {
				address: true,
				appeal: {
					include: {
						address: false
					}
				}
			}
		});

		if (!hearing && updateType !== EventType.Delete) {
			pino.error(
				`Trying to broadcast info for event ${eventId} of type ${eventType}, but it was not found.`
			);
			return false;
		}

		// Handling Cancellation and deletion of hearing
		if (updateType === EventType.Delete && existingHearing) {
			const appeal = await databaseConnector.appeal.findUnique({
				where: { id: existingHearing.appealId }
			});

			if (!appeal) {
				pino.error(
					`Trying to broadcast info for event ${eventId} of type ${eventType}, no appeal was found.`
				);
				return false;
			}

			hearing = {
				id: eventId,
				address: null,
				appealId: appeal.id,
				addressId: null,
				// @ts-ignore
				appeal: {
					reference: appeal.reference
				},
				hearingStartTime: existingHearing.hearingStartTime,
				hearingEndTime: null
			};
		}

		// @ts-ignore
		msg = mapHearingEntity(hearing, updateType);
	}

	if (msg) {
		const validationResult = await validateFromSchema(schemas.events.appealEvent, msg);
		if (validationResult !== true && validationResult.errors) {
			const errorDetails = validationResult.errors?.map(
				(e) => `${e.instancePath || '/'}: ${e.message}`
			);

			pino.error(`Error validating ${eventType} entity: ${errorDetails}`);
			return false;
		}

		const topic = producers.boEventData;
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
