import { updatePersonalList } from '#utils/update-personal-list.js';

/**
 * @param {import('../../server/utils/db-client/index.js').PrismaClient} databaseConnector
 */
export const seedPersonalList = async (databaseConnector) => {
	const appealsWithoutPersonalListEntry = await databaseConnector.appeal.findMany({
		select: { id: true },
		where: { PersonalList: { is: null } }
	});
	if (appealsWithoutPersonalListEntry.length > 0) {
		console.log(
			`PersonalList will be refreshed for ${appealsWithoutPersonalListEntry.length} appeals`
		);
	}
	for (const appeal of appealsWithoutPersonalListEntry) {
		await updatePersonalList(appeal.id);
	}
};
