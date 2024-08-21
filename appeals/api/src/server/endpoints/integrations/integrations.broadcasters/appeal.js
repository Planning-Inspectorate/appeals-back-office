import config from '#config/config.js';
import pino from '#utils/logger.js';
import { databaseConnector } from '#utils/database-connector.js';
import { EventType } from '@pins/event-client';
import { messageMappers } from '../integrations.mappers.js';
import { schemas, validateFromSchema } from '../integrations.validators.js';
import { producers } from '#infrastructure/topics.js';
import { eventClient } from '#infrastructure/event-client.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { CASE_RELATIONSHIP_LINKED, CASE_RELATIONSHIP_RELATED } from '#endpoints/constants.js';

/**
 *
 * @param {number} appealId
 * @param {string} updateType
 */
export const broadcastAppeal = async (appealId, updateType = EventType.Update) => {
	if (!config.serviceBusEnabled) {
		return false;
	}

	pino.info({ appealId, updateType });
	const appeal = await databaseConnector.appeal.findUnique({
		where: { id: appealId },
		include: {
			address: true,
			appealTimetable: true,
			procedureType: true,
			appealType: true,
			appealStatus: true,
			caseOfficer: true,
			inspector: true,
			lpa: true,
			allocation: true,
			siteVisit: true,
			inspectorDecision: true,
			specialisms: {
				include: {
					specialism: true
				}
			},
			neighbouringSites: {
				include: {
					address: true
				}
			},
			parentAppeals: true,
			childAppeals: true,
			appellantCase: {
				include: {
					appellantCaseValidationOutcome: true,
					appellantCaseInvalidReasonsSelected: {
						include: {
							appellantCaseInvalidReason: true,
							appellantCaseInvalidReasonText: true
						}
					},
					appellantCaseIncompleteReasonsSelected: {
						include: {
							appellantCaseIncompleteReason: true,
							appellantCaseIncompleteReasonText: true
						}
					},
					knowsAllOwners: true,
					knowsOtherOwners: true
				}
			},
			lpaQuestionnaire: {
				include: {
					lpaNotificationMethods: {
						include: {
							lpaNotificationMethod: true
						}
					},
					listedBuildingDetails: true,
					lpaQuestionnaireValidationOutcome: true,
					lpaQuestionnaireIncompleteReasonsSelected: {
						include: {
							lpaQuestionnaireIncompleteReason: true,
							lpaQuestionnaireIncompleteReasonText: true
						}
					}
				}
			}
		}
	});

	if (!appeal) {
		pino.error(`Trying to broadcast info for appeal ${appealId} , but it was not found.`);
		return false;
	}

	const appealRelationships = [...appeal.parentAppeals, ...appeal.childAppeals];

	const linkedAppeals = appealRelationships.filter(
		(relationship) => relationship.type === CASE_RELATIONSHIP_LINKED
	);
	const relatedAppeals = appealRelationships.filter(
		(relationship) => relationship.type === CASE_RELATIONSHIP_RELATED
	);

	// @ts-ignore
	const msg = messageMappers.mapAppeal({
		...appeal,
		linkedAppeals,
		relatedAppeals
	});
	if (msg) {
		const validationResult = await validateFromSchema(schemas.events.appeal, msg);
		if (validationResult !== true && validationResult.errors) {
			const errorDetails = validationResult.errors?.map(
				(e) => `${e.instancePath || '/'}: ${e.message}`
			);

			pino.error(`Error validating appeal: ${errorDetails[0]}`);
			return false;
		}

		const topic = producers.boCaseData;
		const res = await eventClient.sendEvents(topic, [msg], updateType, {
			sourceSystem: ODW_SYSTEM_ID
		});

		if (res) {
			return true;
		}
	}
};
