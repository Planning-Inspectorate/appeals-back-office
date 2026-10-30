import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Api.Timetable} Timetable */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateTimetableRequest} UpdateTimetableRequest */
/** @typedef {import('@pins/appeals.api').Schema.AppealTimetable} AppealTimetable */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} id
 * @param {number} appealVersion
 * @param {Partial<AppealTimetable>} data
 * @returns {PrismaPromise<AppealTimetable>}
 */
const upsertAppealTimetableById = (id, appealVersion , data) =>
	databaseConnector.appealTimetable.upsert({
		where: { appealId_associatedAppealVersion: {
				appealId: id,
				associatedAppealVersion: appealVersion
			} },
		update: data,
		create: {
			...data,
			appealId: id,
			associatedAppealVersion: appealVersion
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
 * @param {number} appealVersion
 * @param {Timetable} data
 * @returns {PrismaPromise<AppealTimetable>}
 */
const updateAppealTimetableByAppealId = (appealId, appealVersion, data) =>
	databaseConnector.appealTimetable.update({
		where: { appealId_associatedAppealVersion: {
				appealId: id,
				associatedAppealVersion: appealVersion
			}},
		data
	});

export default {
	updateAppealTimetableById,
	upsertAppealTimetableById,
	updateAppealTimetableByAppealId
};
