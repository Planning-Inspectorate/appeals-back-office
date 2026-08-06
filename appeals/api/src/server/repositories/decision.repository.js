import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} InspectorDecision */
/**
 * @typedef {import('@pins/appeals-database/src/client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} appealId
 * @param {string} documentGuid
 * @returns {PrismaPromise<InspectorDecision>}
 */
export const updateAppealDecisionLetter = (appealId, documentGuid) => {
	return databaseConnector.inspectorDecision.update({
		where: { appealId: appealId },
		data: {
			decisionLetterGuid: documentGuid
		}
	});
};

/**
 * @param {number} appealId
 * @param {Date} caseDecisionOutcomeDate
 * @returns {PrismaPromise<InspectorDecision>}
 */
export const updateAppealCaseDecisionOutcomeDate = (appealId, caseDecisionOutcomeDate) => {
	return databaseConnector.inspectorDecision.update({
		where: { appealId },
		data: {
			caseDecisionOutcomeDate
		}
	});
};
