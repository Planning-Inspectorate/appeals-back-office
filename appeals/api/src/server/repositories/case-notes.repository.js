import { DATABASE_ORDER_BY_DESC } from '#endpoints/constants.js';
import { databaseConnector } from '#utils/database-connector.js';

/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.CaseNote } CaseNote */

/**
 *
 * @param {number} caseId
 * @returns {PrismaPromise<CaseNote[]>}
 */
export const getAllCaseNotesByAppealId = (caseId) => {
	return databaseConnector.caseNote.findMany({
		where: { caseId },
		include: {
			user: true
		},
		orderBy: { createdAt: DATABASE_ORDER_BY_DESC }
	});
};

/**
 *
 * @param {number} id
 * @returns {PrismaPromise<CaseNote|null>}
 */
export const getCaseNoteByCaseNoteId = (id) => {
	return databaseConnector.caseNote.findUnique({
		where: { id }
	});
};

/**
 *
 * @param {import('#endpoints/appeals.js').CreateCaseNote} data
 * @returns {PrismaPromise<CaseNote>}
 */
export const postCaseNote = (data) => {
	return databaseConnector.caseNote.create({
		data: {
			case: {
				connect: { id: data.caseId }
			},
			user: {
				connect: {
					id: data.userId
				}
			},
			comment: data.comment
		}
	});
};
