/** @typedef {import('#utils/db-client/models.ts').LPACreateInput} LPA */

/**
 *
 * @param {LPA[]} localPlanningDepartmentList
 * @param {Record<string, number|null>} lpaTeamAssignments
 * @return {LPA[]}
 */
export const mapLpasToTeams = (localPlanningDepartmentList, lpaTeamAssignments) => {
	return localPlanningDepartmentList.map((lpa) => {
		//@ts-ignore
		const teamId = lpaTeamAssignments[lpa.lpaCode];
		return {
			...lpa,
			teamId
		};
	});
};
