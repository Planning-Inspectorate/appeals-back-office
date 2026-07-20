import { TEAM_NAME_MAP } from '@pins/appeals/constants/common.js';

export const teamsToCreate = [
	{ id: 1, name: 'Ops Test', email: 'opstest@planninginspectorate.co.uk' },
	{ id: 2, name: 'DevTeam1', email: 'devteam1@planninginspectorate.gov.uk' },
	{
		id: 3,
		name: 'Enforcement Appeals Team - Team 1',
		email: 'TeamE1@planninginspectorate.gov.uk'
	},
	{
		id: 4,
		name: 'Enforcement Appeals Team - Team 2',
		email: 'TeamE2@planninginspectorate.gov.uk'
	},
	{
		id: 5,
		name: 'Enforcement Appeals Team - Team 3',
		email: 'TeamE3@planninginspectorate.gov.uk'
	},
	{
		id: 6,
		name: 'Enforcement Appeals Team - Team 4',
		email: 'TeamE4@planninginspectorate.gov.uk'
	},
	{
		id: 7,
		name: TEAM_NAME_MAP.ENFORCEMENT_APPEALS_TEAM,
		email: 'ECAT@planninginspectorate.gov.uk'
	},
	{ id: 8, name: 'PADS team', email: 'PADSplanning@planninginspectorate.gov.uk' },
	{ id: 9, name: 'DevTeam2', email: 'devteam2@planninginspectorate.gov.uk' }
];
