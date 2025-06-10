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
		lpaCode: 'Q1111',
		name: 'System Test Borough Council 2',
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
		lpaCode: 'T1600',
		name: 'Gloucestershire',
		email: 'planningdc@gloucestershire.gov.uk'
	},
	{
		lpaCode: 'J1725',
		name: 'Gosport',
		email: 'planning@gosport.gov.uk'
	},
	{
		lpaCode: 'E5330',
		name: 'Greenwich',
		email: 'planning-enforcement@royalgreenwich.gov.uk'
	},
	{
		lpaCode: 'B5480',
		name: 'Havering',
		email: 'planning_appeals@havering.gov.uk'
	},
	{
		lpaCode: 'L5810',
		name: 'Richmond',
		email: 'richmondplanningappeals@richmondandwandsworth.gov.uk'
	},
	{
		lpaCode: 'V3310',
		name: 'Sedgemoor',
		email: 'development.control@sedgemoor.gov.uk'
	}
];
