import { databaseConnector } from '#utils/database-connector.js';

/**
 *
 * @param {string} lpaCode
 * @returns {Promise< number | null>}
 */
export const getTeamIdFromLpaCode = async (lpaCode) => {
	const team = await databaseConnector.lPA.findUnique({
		where: { lpaCode },
		select: { teamId: true }
	});

	if (!team) {
		return null;
	}

	return team.teamId;
};

/**
 *
 * @param {string} name
 * @returns {Promise< number | null>}
 */
export const getTeamIdFromName = async (name) => {
	const team = await databaseConnector.team.findUnique({
		where: { name },
		select: { id: true }
	});

	if (!team) {
		return null;
	}

	return team.id;
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
			id: true,
			name: true,
			email: true
		}
	});
};

/**
 *
 * @returns {Promise<{id: Number, name: string, email: string| null}[]>}
 */
export const getCaseTeams = () => {
	return databaseConnector.team.findMany({
		select: {
			id: true,
			name: true,
			email: true
		}
	});
};
