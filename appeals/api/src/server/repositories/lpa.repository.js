import { databaseConnector } from '#utils/database-connector.js';

/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.LPA} LPA */
/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * Get LPA by ID
 * @param {number} id
 * @returns {PrismaPromise<LPA|null>}
 */
const getLpaById = (id) => {
	return databaseConnector.lPA.findUnique({ where: { id } });
};

/**
 * Updates LPA code by appeal ID
 * @param {Appeal} appeal
 * @param {number} newLpaId
 * @returns {PrismaPromise<*>}
 */
const updateLpaByAppealId = (appeal, newLpaId) => {
	return databaseConnector.appeal.update({
		where: { id: appeal.id },
		data: {
			lpaId: newLpaId,
			caseUpdatedDate: new Date()
		}
	});
};

/**
 * Get LPAs by IDs
 * @param {number[]} ids
 * @returns {PrismaPromise<LPA[]>}
 */
const getLpasByIds = (ids) => {
	return databaseConnector.lPA.findMany({
		where: { id: { in: ids } },
		orderBy: { name: 'asc' }
	});
};

export default {
	getLpaById,
	updateLpaByAppealId,
	getLpasByIds
};
