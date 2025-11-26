import config from '#config/config.js';
import { eventClient } from '#infrastructure/event-client.js';
import { producers } from '#infrastructure/topics.js';
import {
	mapHearingEntity,
	mapInquiryEntity,
	mapSiteVisitEntity
} from '#mappers/integration/map-event-entity.js';
import { databaseConnector } from '#utils/database-connector.js';
import pino from '#utils/logger.js';
import { EVENT_TYPE, ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { EventType } from '@pins/event-client';
import { schemas, validateFromSchema } from '../integrations.validators.js';
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealEvent} AppealEvent */
/** @typedef {import('@pins/appeals.api').Schema.Hearing} Hearing */
/** @typedef {import('@pins/appeals.api').Schema.Inquiry} Inquiry */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */
/** @typedef {import('#utils/db-client').Hearing | import('#utils/db-client').Inquiry | import('#utils/db-client').SiteVisit | undefined | null} ExistingEvent */

/**
 *
 * @param {number} eventId
 * @param {string} eventType
 * @param {string} updateType
 * @param {ExistingEvent} existingEvent
 * @returns
 */
export const broadcastEvent = async (eventId, eventType, updateType, existingEvent = undefined) => {
	if (!config.serviceBusEnabled && config.NODE_ENV !== 'development') {
		return false;
	}
	let msg;

	try {
		switch (eventType) {
			case EVENT_TYPE.SITE_VISIT:
				msg = await handleSiteVisitEvent(eventId, updateType, existingEvent);
				break;

			case EVENT_TYPE.HEARING:
				msg = await handleHearingEvent(eventId, updateType, existingEvent);
				break;

			case EVENT_TYPE.INQUIRY:
				msg = await handleInquiryEvent(eventId, updateType, existingEvent);
				break;

			default:
				pino.warn(`Unknown eventType: ${eventType}. No broadcast will be sent.`);
				return false;
		}

		if (!msg) {
			return false;
		}

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
		return false;
	} catch (error) {
		pino.error(error, `Failed to handle event ${eventId} of type ${eventType}`);
		return false;
	}
};

/**
 * @param {number} eventId
 * @param {string} updateType
 * @param {ExistingEvent} existingEvent
 */
async function handleSiteVisitEvent(eventId, updateType, existingEvent) {
	let siteVisit;

	if (updateType === EventType.Delete) {
		siteVisit = await reconstructDeletedSiteVisit(eventId, existingEvent);
		if (!siteVisit) return false;
	} else {
		siteVisit = await databaseConnector.siteVisit.findUnique({
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
			logEventNotFoundError(eventId, EVENT_TYPE.SITE_VISIT);
			return false;
		}
	}

	// @ts-ignore
	return mapSiteVisitEntity(siteVisit, updateType);
}

/**
 * @param {number} eventId
 * @param {string} updateType
 * @param {ExistingEvent} existingEvent
 */
async function handleHearingEvent(eventId, updateType, existingEvent) {
	let hearing;

	if (updateType === EventType.Delete) {
		hearing = await reconstructDeletedHearing(eventId, existingEvent);
		if (!hearing) return false;
	} else {
		hearing = await databaseConnector.hearing.findUnique({
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

		if (!hearing) {
			logEventNotFoundError(eventId, EVENT_TYPE.HEARING);
			return false;
		}
	}

	// @ts-ignore
	return mapHearingEntity(hearing, updateType);
}

/**
 * @param {number} eventId
 * @param {string} updateType
 * @param {ExistingEvent} existingEvent
 */
async function handleInquiryEvent(eventId, updateType, existingEvent) {
	let inquiry;

	if (updateType === EventType.Delete) {
		inquiry = await reconstructDeletedInquiry(eventId, existingEvent);
		if (!inquiry) return false;
	} else {
		inquiry = await databaseConnector.inquiry.findUnique({
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

		if (!inquiry) {
			logEventNotFoundError(eventId, EVENT_TYPE.INQUIRY);
			return false;
		}
	}

	// @ts-ignore
	return mapInquiryEntity(inquiry, updateType);
}

/**
 * @param {number} eventId
 * @param {ExistingEvent} existingEvent
 */
async function reconstructDeletedSiteVisit(eventId, existingEvent) {
	const appeal = await getAppealForEvent(existingEvent?.appealId, eventId, EVENT_TYPE.SITE_VISIT);
	if (!appeal) return null;

	return {
		id: eventId,
		appealId: appeal.id,
		// @ts-ignore
		appeal: {
			reference: appeal.reference,
			// @ts-ignore
			address: appeal.address
		},
		// @ts-ignore
		siteVisitType: existingEvent.siteVisitType,
		siteVisitTypeId: null,
		// @ts-ignore
		visitDate: existingEvent.visitDate,
		// @ts-ignore
		visitStartTime: existingEvent?.visitStartTime,
		visitEndTime: null,
		whoMissedSiteVisit: null
	};
}

/**
 * @param {number} eventId
 * @param {ExistingEvent} existingEvent
 */
async function reconstructDeletedHearing(eventId, existingEvent) {
	const appeal = await getAppealForEvent(existingEvent?.appealId, eventId, EVENT_TYPE.HEARING);
	if (!appeal) return null;

	return {
		id: eventId,
		address: null,
		appealId: appeal.id,
		addressId: null,
		// @ts-ignore
		appeal: {
			reference: appeal.reference
		},
		// @ts-ignore
		hearingStartTime: existingEvent.hearingStartTime,
		hearingEndTime: null
	};
}

/**
 * @param {number} eventId
 * @param {ExistingEvent} existingEvent
 */
async function reconstructDeletedInquiry(eventId, existingEvent) {
	const appeal = await getAppealForEvent(existingEvent?.appealId, eventId, EVENT_TYPE.INQUIRY);
	if (!appeal) return null;

	return {
		id: eventId,
		address: null,
		appealId: appeal.id,
		addressId: null,
		// @ts-ignore
		appeal: {
			reference: appeal.reference
		},
		// @ts-ignore
		inquiryStartTime: existingEvent.inquiryStartTime,
		inquiryEndTime: null
	};
}

/**
 * @param {number} eventId
 * @param {string} eventType
 */
function logEventNotFoundError(eventId, eventType) {
	pino.error(
		`Trying to broadcast info for event ${eventId} of type ${eventType}, but it was not found.`
	);
}

/**
 * @param {number|undefined} appealId
 * @param {number} eventId
 * @param {string} eventType
 */
async function getAppealForEvent(appealId, eventId, eventType) {
	if (!appealId) {
		pino.error(
			`Trying to process delete for event ${eventId} (${eventType}), but existingEvent has no appealId.`
		);
		return null;
	}

	const appeal = await databaseConnector.appeal.findUnique({
		where: { id: appealId }
	});

	if (!appeal) {
		pino.error(
			`Trying to broadcast info for event ${eventId} of type ${eventType}, no appeal was found with id ${appealId}.`
		);
		return null;
	}
	return appeal;
}
