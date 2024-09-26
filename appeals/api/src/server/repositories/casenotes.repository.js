import { DATABASE_ORDER_BY_DESC } from '#endpoints/constants.js';
import { databaseConnector } from '#utils/database-connector.js';

/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.Casenote } Casenote */

/**
 *
 * @param {number} caseId
 * @returns {PrismaPromise<Casenote[]>}
 */
export const getAllCasenotesByAppealId = (caseId) => {
	return databaseConnector.casenote.findMany({
		where: { caseId },
		include: {
			user: true
		},
		orderBy: { createdAt: DATABASE_ORDER_BY_DESC }
	})
}

/**
 *
 * @param {number} id
 * @returns {PrismaPromise<Casenote|null>}
 */
export const getCasenoteByCasenoteId = (id) => {
	return databaseConnector.casenote.findUnique({
		where: {id}
	})
}

/**
 *
 * @param {import('#endpoints/appeals.js').CreateCasenote} data
 * @returns {PrismaPromise<Casenote>}
 */
export const postCasenote = (data) => {
	return databaseConnector.casenote.create({
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
	})
}
