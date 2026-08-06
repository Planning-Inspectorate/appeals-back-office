/** @typedef {import('#utils/db-client/models.ts').TeamCreateInput} Team */

/**
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 * @param {Team[]} teams
 * @returns {Promise<Map<string, number>>} A map of team names to their IDs
 */
export const seedTeams = async (databaseConnector, teams) => {
	const teamNameToIdMap = new Map();
	for (const team of teams) {
		const existingTeamByName = await databaseConnector.team.findUnique({
			where: { name: team.name }
		});

		const existingTeamById = team.id
			? await databaseConnector.team.findUnique({
					where: { id: team.id }
				})
			: null;

		let teamRecord;
		if (existingTeamByName) {
			teamRecord = await databaseConnector.team.update({
				where: { id: existingTeamByName.id },
				data: {
					name: team.name,
					email: team.email
				}
			});
		} else if (existingTeamById) {
			teamRecord = await databaseConnector.team.update({
				where: { id: existingTeamById.id },
				data: {
					name: team.name,
					email: team.email
				}
			});
		} else {
			teamRecord = await databaseConnector.team.create({
				data: team
			});
		}

		teamNameToIdMap.set(teamRecord.name, teamRecord.id);
	}
	return teamNameToIdMap;
};
