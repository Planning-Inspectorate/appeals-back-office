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
	}
];
