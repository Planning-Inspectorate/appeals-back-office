/** @typedef {import('#utils/db-client/index.js').Prisma.LPACreateInput} LPA */

/**
 * @returns {LPA[]}
 */
export const localPlanningDepartmentList = [
	{
		lpaCode: 'Q9999',
		name: 'System Test Borough Council',
		email: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
	},
	{
		lpaCode: 'N5090',
		name: 'Barnet',
		email: 'planning.appeals@barnet.gov.uk'
	},
	{
		lpaCode: 'G5180',
		name: 'Bromley',
		email: 'planningappeals@bromley.gov.uk'
	},
	{
		lpaCode: 'E5330',
		name: 'Greenwich',
		email: 'planning-enforcement@royalgreenwich.gov.uk'
	},
	{
		lpaCode: 'B5480',
		name: 'Havering',
		email: 'planning.appeals@havering.gov.uk'
	},
	{
		lpaCode: 'L5810',
		name: 'Richmond',
		email: 'planningappeals@richmond.gov.uk'
	}
];
