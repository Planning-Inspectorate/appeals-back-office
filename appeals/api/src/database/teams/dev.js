export const teamsToCreate = [
	{ id: 1, name: 'Ops Test', email: 'opstest@planninginspectorate.co.uk' },
	{ id: 2, name: 'DevTeam1', email: 'devteam1@planninginspectorate.gov.uk' },
	{ id: 3, name: 'DevTeam2', email: 'devteam2@planninginspectorate.gov.uk' },
	{ id: 6, name: 'Major Casework Officer', email: 'majorcasework@planninginspectorate.gov.uk' },
	{
		id: 7,
		name: 'Enforcement Appeals Officer',
		email: 'enforcementappeals@planninginspectorate.gov.uk'
	}
];

/**
 * @type {Record<string, number>}
 */
export const lpaTeamAssignments = {
	// Ops Test
	Q9999: 1,
	Q1111: 1,

	// DevTeam1
	MAID: 2,
	BARN: 2,
	WORT: 2,
	DORS: 2,

	// DevTeam2
	BASI: 3,
	WILT: 3,
	WAVE: 3,
	BRIS: 3
};
