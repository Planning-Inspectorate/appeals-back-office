// Tags for @cypress/grep. Import these rather than typing strings, so a typo can't drop a test from a run.
export const tag = {
	// Run tier
	smoke: '@smoke',
	e2e: '@e2e',

	// Appeal type
	s78: '@s78',
	s20: '@s20',
	has: '@has',
	casPlanning: '@casPlanning',
	casAdverts: '@casAdverts',
	advert: '@advert',
	enforcement: '@enforcement',
	enforcementListed: '@enforcementListed',

	// Regs grouping
	newRegs: '@newRegs',
	oldRegs: '@oldRegs',

	// Procedure
	written: '@written',
	hearing: '@hearing',
	inquiry: '@inquiry',
	expedited: '@expedited',

	// Feature area
	validation: '@validation',
	startCase: '@startCase',
	lpaq: '@lpaq',
	representations: '@representations',
	siteVisit: '@siteVisit',
	decision: '@decision',
	costs: '@costs',
	documents: '@documents',
	correspondence: '@correspondence',
	linkedAppeals: '@linkedAppeals',
	caseDetails: '@caseDetails',
	personalList: '@personalList',
	search: '@search',
	timetable: '@timetable',
	changeAppeal: '@changeAppeal'
};
