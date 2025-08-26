import { databaseConnector } from '#utils/database-connector.js';

/**
 *
 * @param {string} lpaCode
 * @returns {Promise<{id: number | null}>}
 */
export const getTeamIdFromLpaCode = async (lpaCode) => {
	const team = await databaseConnector.lPA.findUnique({
		where: { lpaCode },
		select: { teamId: true }
	});

	if (!team) {
		return {
			id: null
		};
	}

	return { id: team.teamId };
};
/**
 *
 * @param {number} teamId
 * @returns {Promise<{name: string|null, email: string|null}| null>}
 */
export const getAssignedTeam = (teamId) => {
	return databaseConnector.team.findUnique({
		where: { id: teamId },
		select: {
			name: true,
			email: true
		}
	});
};
