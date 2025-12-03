import { databaseConnector } from '#utils/database-connector.js';
import { DATABASE_ORDER_BY_DESC } from '@pins/appeals/constants/support.js';

/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
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
 */
export const getCaseNoteByCaseNoteId = (id) => {
	return databaseConnector.caseNote.findUnique({
		where: { id }
	});
};

/**
 *
 * @param {import('#endpoints/appeals.js').CreateCaseNote} data
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
