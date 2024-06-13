import config from '#config/config.js';
//import { databaseConnector } from '#utils/database-connector.js';
import pino from '#utils/logger.js';
import { EventType } from '@pins/event-client';

export const broadcastAppeal = async (
	/** @type {Number} */ appealId,
	/** @type {string} */ updateType = EventType.Update
) => {
	if (!config.serviceBusEnabled) {
		//return false;
	}

	pino.info({ appealId, updateType });
	// const appeal = await databaseConnector.appeal.findUnique({
	// 	where: { id: appealId },
	// 	include: {
	// 		address: true,
	// 		appealTimetable: true,
	// 		procedureType: true,
	// 		appealType: true,
	// 		appealStatus: true,
	// 		caseOfficer: true,
	// 		inspector: true,
	// 		lpa: true,
	// 		allocation: true,
	// 		siteVisit: true,
	// 		specialisms: {
	// 			include: {
	// 				specialism: true
	// 			}
	// 		},
	// 		appellantCase: {
	// 			include: {
	// 				appellantCaseInvalidReasonsSelected: {
	// 					include: {
	// 						appellantCaseInvalidReason: true,
	// 						appellantCaseInvalidReasonText: true
	// 					}
	// 				},
	// 				appellantCaseIncompleteReasonsSelected: {
	// 					include: {
	// 						appellantCaseIncompleteReason: true,
	// 						appellantCaseIncompleteReasonText: true
	// 					}
	// 				},
	// 				knowsAllOwners: true,
	// 				knowsOtherOwners: true
	// 			}
	// 		},
	// 		lpaQuestionnaire: {
	// 			include: {
	// 				lpaQuestionnaireIncompleteReasonsSelected: {
	// 					include: {
	// 						lpaQuestionnaireIncompleteReason: true,
	// 						lpaQuestionnaireIncompleteReasonText: true
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}
	// });

	//console.log(appeal)
};
