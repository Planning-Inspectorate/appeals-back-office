import { databaseConnector } from '../../server/utils/database-connector.js';
import { seedStaticData } from './data-static.js';
import { localPlanningDepartmentList as localPlanningDepartmentListProd } from './LPAs/prod.js';
import { localPlanningDepartmentList } from './LPAs/training.js';
import { mapLpasToTeams } from './map-lpa-and-teams.js';
import { seedLPAs } from './seed-lpas.js';
import { seedTeams } from './seed-teams.js';
import {
	teamsToCreate as pordTeamsToCreate,
	lpaTeamAssignments as prodLpaTeamAssignments
} from './teams/prod.js';
import {
	lpaTeamAssignments as trainingLpaTeamAssignments,
	teamsToCreate as trainingTeamsToCreate
} from './teams/training.js';

/** @typedef {import('#utils/db-client/index.js').Prisma.TeamCreateInput} Team */
/** @typedef {Record<string, number|null>} lpaTeamAssignments */

/**
 *
 * @param {lpaTeamAssignments} lpaAssignments1
 * @param {lpaTeamAssignments} lpaAssignments2
 * @param {Team[]} teamsToCreate1
 * @param {Team[]} teamsToCreate2
 */
const combineTeamsAndTeamAssignments = (
	lpaAssignments1,
	lpaAssignments2,
	teamsToCreate1,
	teamsToCreate2
) => {
	return {
		lpaAssignments: { ...lpaAssignments1, ...lpaAssignments2 },
		teamsToCreate: [...teamsToCreate1, ...teamsToCreate2]
	};
};
/**
 * Seed the training database with the required static data
 *
 * @throws {Error} If any database operation fails.
 * @returns {Promise<void>}
 */
const seedTraining = async () => {
	try {
		const { lpaAssignments, teamsToCreate } = combineTeamsAndTeamAssignments(
			trainingLpaTeamAssignments,
			prodLpaTeamAssignments,
			trainingTeamsToCreate,
			pordTeamsToCreate
		);
		await seedStaticData(databaseConnector);
		await seedTeams(databaseConnector, teamsToCreate);
		const mappedLPAs = mapLpasToTeams(
			[...localPlanningDepartmentList, ...localPlanningDepartmentListProd],
			lpaAssignments
		);
		await seedLPAs(databaseConnector, mappedLPAs);
	} catch (error) {
		console.error(error);
		throw error;
	} finally {
		await databaseConnector.$disconnect();
	}
};

await seedTraining();
