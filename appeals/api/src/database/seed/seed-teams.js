/** @typedef {import('#utils/db-client/index.js').Prisma.TeamCreateInput} Team */

/**
 * @param {import('../../server/utils/db-client/index.js').PrismaClient} databaseConnector
 * @param {Team[]} teams
 * @returns {Promise<Map<string, number>>} A map of team names to their IDs
 */
export const seedTeams = async (databaseConnector, teams) => {
	const teamNameToIdMap = new Map();
	for (const team of teams) {
		const newTeam = await databaseConnector.team.upsert({
			create: team,
			where: { name: team.name },
			update: team
		});
		teamNameToIdMap.set(newTeam.name, newTeam.id);
	}
	return teamNameToIdMap;
};
