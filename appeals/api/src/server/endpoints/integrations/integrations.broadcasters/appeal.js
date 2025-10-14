import config from '#config/config.js';
import { eventClient } from '#infrastructure/event-client.js';
import { producers } from '#infrastructure/topics.js';
import { contextEnum } from '#mappers/context-enum.js';
import { mapCase } from '#mappers/mapper-factory.js';
import { databaseConnector } from '#utils/database-connector.js';
import pino from '#utils/logger.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import {
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED
} from '@pins/appeals/constants/support.js';
import { EventType } from '@pins/event-client';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { schemas, validateFromSchema } from '../integrations.validators.js';

/**
 *
 * @param {number} appealId
 * @param {string} updateType
 */
export const broadcastAppeal = async (appealId, updateType = EventType.Update) => {
	if (!config.serviceBusEnabled && config.NODE_ENV !== 'development') {
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
					},
					designatedSiteNames: {
						include: {
							designatedSite: true
						}
					}
				}
			},
			representations: true
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

	const msg = mapCase({
		// @ts-ignore
		appeal: { ...appeal, linkedAppeals, relatedAppeals },
		context: contextEnum.broadcast
	});

	if (msg) {
		const schema = getSchemaForCaseType(appeal.appealType?.key || APPEAL_CASE_TYPE.D);
		const topic = getTopicForCaseType(appeal.appealType?.key || APPEAL_CASE_TYPE.D);

		const validationResult = await validateFromSchema(schema, msg);
		if (validationResult !== true && validationResult.errors) {
			const errorDetails = validationResult.errors?.map(
				(e) => `${e.instancePath || '/'}: ${e.message}`
			);

			pino.error(`Error validating appeal: ${errorDetails[0]}`);
			return false;
		}

		const res = await eventClient.sendEvents(topic, [msg], updateType, {
			sourceSystem: ODW_SYSTEM_ID
		});

		if (res) {
			return true;
		}
	}
};

/**
 *
 * @param {string} caseType
 * @returns {string}
 */
function getSchemaForCaseType(caseType) {
	//TODO: Align data model - currently defaulting to S78 schema
	switch (caseType) {
		case APPEAL_CASE_TYPE.D:
		case APPEAL_CASE_TYPE.ZP:
		case APPEAL_CASE_TYPE.H:
		case APPEAL_CASE_TYPE.ZA:
			return schemas.events.appealHas;
		default:
			return schemas.events.appealS78;
	}
}

/**
 *
 * @param {string} caseType
 * @returns {string}
 */
function getTopicForCaseType(caseType) {
	switch (caseType) {
		case APPEAL_CASE_TYPE.D:
		case APPEAL_CASE_TYPE.ZP:
			return producers.boCaseData;
		default:
			return producers.boCaseDataS78;
	}
}
