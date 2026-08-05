import redisClient from '#infrastructure/redis.js';
import { databaseConnector } from '#utils/database-connector.js';
import logger from '#utils/logger.js';
import { TEAM_NAME_MAP } from '@pins/appeals/constants/common.js';

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
 * @param {string} lpaCode
 * @returns {Promise< number | null>}
 */
export const getEnforcementTeamIdFromLpaCode = async (lpaCode) => {
	const team = await databaseConnector.lPA.findUnique({
		where: { lpaCode },
		select: { enforcementTeamId: true }
	});

	if (!team) {
		return null;
	}

	return team.enforcementTeamId;
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
export const getCaseTeams = async () => {
	const cacheTimeInSeconds = 600;
	const cacheKey = 'getCaseTeams';

	const getTeams = async () =>
		databaseConnector.team.findMany({
			where: {
				NOT: {
					name: TEAM_NAME_MAP.ENFORCEMENT_APPEALS_TEAM
				}
			},
			select: {
				id: true,
				name: true,
				email: true
			}
		});

	if (!redisClient) {
		logger.info('getCaseTeams no redis client');
		return getTeams();
	}

	return redisClient.getOrSet('getCaseTeams', cacheKey, cacheTimeInSeconds, getTeams);
};

/**
 *
 * @param {number} appealId
 * @returns
 */
export const getTeamFromAppeal = async (appealId) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: { id: appealId },
		select: { assignedTeamId: true }
	});

	if (!appeal || !appeal.assignedTeamId) {
		return null;
	}
	return getAssignedTeam(appeal.assignedTeamId);
};
