import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Api.Timetable} Timetable */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateTimetableRequest} UpdateTimetableRequest */
/** @typedef {import('@pins/appeals.api').Schema.AppealTimetable} AppealTimetable */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} id
 * @param {Partial<AppealTimetable>} data
 * @returns {PrismaPromise<AppealTimetable>}
 */
const upsertAppealTimetableById = (id, data) =>
	databaseConnector.appealTimetable.upsert({
		where: { appealId: id },
		update: data,
		create: {
			...data,
			appealId: id
		},
		include: {
			appeal: true
		}
	});

/**
 * @param {number} id
 * @param {Timetable} data
 * @returns {PrismaPromise<AppealTimetable>}
 */
const updateAppealTimetableById = (id, data) =>
	databaseConnector.appealTimetable.update({
		where: { id },
		data
	});

/**
 * @param {number} appealId
 * @param {Timetable} data
 * @returns {PrismaPromise<AppealTimetable>}
 */
const updateAppealTimetableByAppealId = (appealId, data) =>
	databaseConnector.appealTimetable.update({
		where: { appealId },
		data
	});

export default {
	updateAppealTimetableById,
	upsertAppealTimetableById,
	updateAppealTimetableByAppealId
};
