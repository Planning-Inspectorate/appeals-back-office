// @ts-nocheck
import { lpaTeamAssignments, teamsToCreate } from '../teams/prod.js';
/**
 *
 * @param {number} id
 * @returns
 */
const getTeamNameById = (id) => {
	const team = teamsToCreate.find((item) => item.id === id);
	return team ? team.name : 'Unknown Team';
};

describe('Team and LPA Assignment Mappings', () => {
	it('should ensure all team IDs in lpaTeamAssignments exist in teamsToCreate', () => {
		const teamIds = new Set(teamsToCreate.map((team) => team.id));
		const assignedTeamIds = new Set(Object.values(lpaTeamAssignments));

		assignedTeamIds.forEach((assignedId) => {
			expect(teamIds.has(assignedId)).toBe(true);
		});
	});

	it('should ensure all team IDs in teamsToCreate are unique', () => {
		const ids = teamsToCreate.map((team) => team.id);
		const uniqueIds = new Set(ids);
		expect(ids.length).toBe(uniqueIds.size);
	});

	it('should ensure all team names in teamsToCreate are unique', () => {
		const names = teamsToCreate.map((team) => team.name);
		const uniqueNames = new Set(names);
		expect(names.length).toBe(uniqueNames.size);
	});

	it('should validate the format of all team email addresses', () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		teamsToCreate.forEach((team) => {
			if (team.email) {
				// eslint-disable-next-line jest/no-conditional-expect
				expect(team.email).toMatch(emailRegex);
			}
		});
	});

	it('should ensure each team object has the required properties (id, name, email)', () => {
		teamsToCreate.forEach((team) => {
			expect(team).toHaveProperty('id');
			expect(typeof team.id).toBe('number');
			expect(team).toHaveProperty('name');
			expect(typeof team.name).toBe('string');
			expect(team).toHaveProperty('email');
			if (team.email !== null) {
				// eslint-disable-next-line jest/no-conditional-expect
				expect(typeof team.email).toBe('string');
			}
		});
	});
	describe('Specific LPA Team Assignments', () => {
		const assignedTeamIds = [...new Set(Object.values(lpaTeamAssignments))];

		assignedTeamIds.forEach((teamId) => {
			const teamName = getTeamNameById(teamId);

			describe(`Team: ${teamName} (ID: ${teamId})`, () => {
				const lpaIdsForThisTeam = Object.keys(lpaTeamAssignments).filter(
					(lpaId) => lpaTeamAssignments[lpaId] === teamId
				);

				lpaIdsForThisTeam.forEach((lpaId) => {
					it(`should correctly assign LPA ID ${lpaId} to ${teamName}`, () => {
						const assignedTeamId = lpaTeamAssignments[lpaId];
						expect(assignedTeamId).toBe(teamId);
					});
				});
			});
		});
	});
	it('should have a consistent and correct set of LPA assignments', () => {
		expect(lpaTeamAssignments).toMatchSnapshot();
	});
});
