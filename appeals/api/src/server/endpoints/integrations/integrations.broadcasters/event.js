import config from '#config/config.js';
import { eventClient } from '#infrastructure/event-client.js';
import { producers } from '#infrastructure/topics.js';
import { mapHearingEntity, mapSiteVisitEntity } from '#mappers/integration/map-event-entity.js';
import { databaseConnector } from '#utils/database-connector.js';
import pino from '#utils/logger.js';
import { EVENT_TYPE, ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { EventType } from '@pins/event-client';
import { schemas, validateFromSchema } from '../integrations.validators.js';
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealEvent} AppealEvent */
/** @typedef {import('@pins/appeals.api').Schema.Hearing} Hearing */
/** @typedef {import('@pins/appeals.api').Schema.Inquiry} Inquiry */

/**
 *
 * @param {number} eventId
 * @param {string} eventType
 * @param {string} updateType
 * @param {Inquiry | Hearing | undefined | null} existingHearing
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
				// @ts-ignore
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
