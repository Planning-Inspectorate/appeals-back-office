import { databaseConnector } from '#utils/database-connector.js';

/** @typedef {import('@pins/appeals.api').Schema.PersonalList} PersonalList */

/**
 * Upserts a personal list entry by appeal id
 * @param {PersonalList} data
 * @returns {Promise<PersonalList>}
 */
const upsertPersonalListEntry = async (data) => {
	const { appealId, ...createData } = data;
	// @ts-ignore
	return databaseConnector.personalList.upsert({
		where: { appealId },
		// @ts-ignore
		create: { ...createData, appeal: { connect: { id: appealId } } },
		update: data
	});
};

export default {
	upsertPersonalListEntry
};
