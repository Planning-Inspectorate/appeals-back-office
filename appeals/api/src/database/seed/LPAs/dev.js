/** @typedef {import('#utils/db-client/models.ts').LPACreateInput} LPA */

/**
 * @returns {LPA[]}
 */
export const localPlanningDepartmentList = [
	{
		lpaCode: 'Q9999',
		name: 'System Test Borough Council',
		email: 'appealplanningdecisiontest@planninginspectorate.gov.uk',
		teamId: null // Ops Test
	},
	{
		lpaCode: 'Q1111',
		name: 'System Test Borough Council 2',
		email: 'appealplanningdecisiontest@planninginspectorate.gov.uk',
		teamId: 1 // Ops Test
	},
	{
		lpaCode: 'MAID',
		name: 'Maidstone Borough Council',
		email: 'maid@lpa-email.gov.uk',
		teamId: 2 // Ops Test
	},
	{
		lpaCode: 'BARN',
		name: 'Barnsley Metropolitan Borough Council',
		email: 'barn@lpa-email.gov.uk',
		teamId: 2 // Ops Test
	},
	{
		lpaCode: 'WORT',
		name: 'Worthing Borough Council',
		email: 'wort@lpa-email.gov.uk',
		teamId: 2 // Ops Test
	},
	{
		lpaCode: 'DORS',
		name: 'Dorset Council',
		email: 'dors@lpa-email.gov.uk',
		teamId: 2 // Ops Test
	},
	{
		lpaCode: 'BASI',
		name: 'Basingstoke and Deane Borough Council',
		email: 'basi@lpa-email.gov.uk',
		teamId: 3 // Ops Test
	},
	{
		lpaCode: 'WILT',
		name: 'Wiltshire Council',
		email: 'wilt@lpa-email.gov.uk',
		teamId: 3 // Ops Test
	},
	{
		lpaCode: 'WAVE',
		name: 'Waveney District Council',
		email: 'wave@lpa-email.gov.uk',
		teamId: 3 // Ops Test
	},
	{
		lpaCode: 'BRIS',
		name: 'Bristol City Council',
		email: 'bris@lpa-email.gov.uk',
		teamId: 3 // Ops Test
	}
];
