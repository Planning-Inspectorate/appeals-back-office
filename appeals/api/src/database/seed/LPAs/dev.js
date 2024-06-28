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
		lpaCode: 'MAID',
		name: 'Maidstone Borough Council',
		email: 'maid@lpa-email.gov.uk'
	},
	{
		lpaCode: 'BARN',
		name: 'Barnsley Metropolitan Borough Council',
		email: 'barn@lpa-email.gov.uk'
	},
	{
		lpaCode: 'WORT',
		name: 'Worthing Borough Council',
		email: 'wort@lpa-email.gov.uk'
	},
	{
		lpaCode: 'DORS',
		name: 'Dorset Council',
		email: 'dors@lpa-email.gov.uk'
	},
	{
		lpaCode: 'BASI',
		name: 'Basingstoke and Deane Borough Council',
		email: 'basi@lpa-email.gov.uk'
	},
	{
		lpaCode: 'WILT',
		name: 'Wiltshire Council',
		email: 'wilt@lpa-email.gov.uk'
	},
	{
		lpaCode: 'WAVE',
		name: 'Waveney District Council',
		email: 'wave@lpa-email.gov.uk'
	},
	{
		lpaCode: 'BRIS',
		name: 'Bristol City Council',
		email: 'bris@lpa-email.gov.uk'
	}
];
