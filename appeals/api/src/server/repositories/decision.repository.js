import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} InspectorDecision */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
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
