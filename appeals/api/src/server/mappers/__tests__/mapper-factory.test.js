import { contextEnum } from '#mappers/context-enum.js';
import { mapCase } from '#mappers/mapper-factory.js';
import { mocks } from '#tests/appeals/index.js';

describe('appeals api mappers', () => {
	test('should return undefined if no data', async () => {
		// @ts-ignore
		const output = mapCase({});

		expect(output).toBe(undefined);
	});
	test('should return undefined if case is empty', async () => {
		const appeal = {};
		// @ts-ignore
		const output = mapCase({ appeal });

		expect(output).toBe(undefined);
	});
	test('minimum mapping needs id, date and appellant case', async () => {
		const appeal = { id: 1, caseCreatedDate: new Date(), appellantCase: {} };
		// @ts-ignore
		const output = mapCase({ appeal });

		expect(output).toHaveProperty('appealId');
		expect(output).toHaveProperty('createdAt');
	});
	test('should map basic appeal properties', async () => {
		// @ts-ignore
		const output = mapCase({ appeal: mocks.householdAppeal });

		expect(output).toHaveProperty('createdAt');
		expect(output).toHaveProperty('validAt');
		expect(output).toHaveProperty('startedAt');
		expect(output).toHaveProperty('appealId');
		expect(output).toHaveProperty('appealReference');
		expect(output).toHaveProperty('appealType');
		expect(output).toHaveProperty('appealSite');
		expect(output).toHaveProperty('localPlanningDepartment');
		expect(output).toHaveProperty('appellant');
	});

	test('more properties which could be null to start with', async () => {
		const appeal = {
			...mocks.s78Appeal,
			caseOfficer: { azureAdUserId: '516b95fc-56ad-4e6d-b85d-77248d880081' },
			inspector: { azureAdUserId: '6bcc00b6-50b3-4ef6-9484-9f16a7d89323' }
		};

		// @ts-ignore
		const output = mapCase({ appeal });

		expect(output).toHaveProperty('createdAt');
		expect(output).toHaveProperty('validAt');
		expect(output).toHaveProperty('startedAt');
		expect(output).toHaveProperty('appealId');
		expect(output).toHaveProperty('appealReference');
		expect(output).toHaveProperty('appealType');
		expect(output).toHaveProperty('appealSite');
		expect(output).toHaveProperty('localPlanningDepartment');
		expect(output).toHaveProperty('appellant');
		expect(output).toHaveProperty('caseOfficer');
		expect(output).toHaveProperty('inspector');
		expect(output).toHaveProperty('documentationSummary');
	});

	test('should not map anything when no data in the selected context', async () => {
		const appeal = {
			...mocks.s78Appeal,
			lpaQuestionnaire: null,
			lpaQuestionnaireId: null
		};

		// @ts-ignore
		const output = mapCase({ appeal, context: contextEnum.lpaQuestionnaire });

		expect(output).not.toHaveProperty('lpaQuestionnaire');
	});

	test('should map the correct data for the selected context', async () => {
		const appeal = {
			...mocks.s78Appeal
		};

		// @ts-ignore
		const output = mapCase({ appeal, context: contextEnum.lpaQuestionnaire });

		expect(output).toHaveProperty('siteAccessRequired');
		expect(output).toHaveProperty('healthAndSafety');
	});

	test('should only map the fields specific to the case type', async () => {
		const appealHAS = {
			...mocks.householdAppeal,
			folders: []
		};
		const appealS78 = {
			...mocks.s78Appeal,
			folders: []
		};

		const appealS20 = {
			...mocks.s20Appeal,
			folders: []
		};

		const appealEnforcement = {
			...mocks.enforcementAppeal,
			folders: []
		};

		// @ts-ignore
		const hasAppCaseOutput = mapCase({ appeal: appealHAS, context: contextEnum.appellantCase });

		expect(hasAppCaseOutput).toHaveProperty('siteAccessRequired');
		expect(hasAppCaseOutput).toHaveProperty('healthAndSafety');
		expect(hasAppCaseOutput).not.toHaveProperty('appellantProcedurePreference');

		// @ts-ignore
		const hasLpaqOutput = mapCase({ appeal: appealHAS, context: contextEnum.lpaQuestionnaire });

		expect(hasLpaqOutput).toHaveProperty('siteAccessRequired');
		expect(hasLpaqOutput).toHaveProperty('healthAndSafety');
		expect(hasLpaqOutput).not.toHaveProperty('lpaProcedurePreference');

		// @ts-ignore
		const s78AppCaseOutput = mapCase({ appeal: appealS78, context: contextEnum.appellantCase });

		expect(s78AppCaseOutput).toHaveProperty('siteAccessRequired');
		expect(s78AppCaseOutput).toHaveProperty('healthAndSafety');
		expect(s78AppCaseOutput).toHaveProperty('appellantProcedurePreference');

		// @ts-ignore
		const s78LpaqOutput = mapCase({ appeal: appealS78, context: contextEnum.lpaQuestionnaire });

		expect(s78LpaqOutput).toHaveProperty('siteAccessRequired');
		expect(s78LpaqOutput).toHaveProperty('healthAndSafety');
		expect(s78LpaqOutput).toHaveProperty('lpaProcedurePreference');

		// @ts-ignore
		const s20CaseOutput = mapCase({ appeal: appealS20, context: contextEnum.appellantCase });

		expect(s20CaseOutput).not.toHaveProperty('agriculturalHolding');
		expect(s20CaseOutput).not.toHaveProperty('tenantAgriculturalHolding');
		expect(s20CaseOutput).not.toHaveProperty('otherTenantsAgriculturalHolding');
		expect(s20CaseOutput).not.toHaveProperty('informedTenantsAgriculturalHolding');

		// @ts-ignore
		const s20LpaqOutput = mapCase({ appeal: appealS20, context: contextEnum.lpaQuestionnaire });

		expect(s20LpaqOutput).toHaveProperty('preserveGrantLoan');

		const enforcementAppCaseOutput = mapCase({
			// @ts-ignore
			appeal: appealEnforcement,
			context: contextEnum.appellantCase
		});

		expect(enforcementAppCaseOutput).toHaveProperty('appealGrounds');
		expect(enforcementAppCaseOutput).toHaveProperty('enforcementNotice');
	});

	test('should only map the data model fields specific to the case type', async () => {
		const appealS20 = {
			...mocks.s20Appeal,
			folders: []
		};

		// @ts-ignore
		const s20CaseOutput = mapCase({ appeal: appealS20, context: contextEnum.broadcast });

		expect(s20CaseOutput).not.toBe(null);

		/**
		 * @type {import('@planning-inspectorate/data-model').Schemas.AppealS78Case}
		 */ // @ts-ignore
		const s20LpaqOutput = mapCase({ appeal: appealS20, context: contextEnum.broadcast });

		expect(s20LpaqOutput?.preserveGrantLoan).toBe(true);
		expect(s20LpaqOutput?.consultHistoricEngland).toBe(true);
	});

	test('should only map the appellant case fields specific to the case type', async () => {
		const appealHAS = {
			...mocks.householdAppeal,
			folders: []
		};
		const appealS78 = {
			...mocks.s78Appeal,
			folders: []
		};

		// @ts-ignore
		const hasAppCaseOutput = mapCase({ appeal: appealHAS, context: contextEnum.appellantCase });
		// @ts-ignore
		const s78AppCaseOutput = mapCase({ appeal: appealS78, context: contextEnum.appellantCase });

		expect(hasAppCaseOutput).toHaveProperty('siteAccessRequired');
		expect(hasAppCaseOutput).toHaveProperty('applicant');
		expect(hasAppCaseOutput).toHaveProperty('isAppellantNamedOnApplication');
		expect(hasAppCaseOutput).toHaveProperty('hasAdvertisedAppeal');
		expect(hasAppCaseOutput).toHaveProperty('applicationDate');
		expect(hasAppCaseOutput).toHaveProperty('applicationDecisionDate');
		expect(hasAppCaseOutput).toHaveProperty('appealId');
		expect(hasAppCaseOutput).toHaveProperty('planningApplicationReference');

		expect(hasAppCaseOutput).not.toHaveProperty('appellantProcedurePreference');
		expect(hasAppCaseOutput).not.toHaveProperty('agriculturalHolding');
		expect(hasAppCaseOutput).not.toHaveProperty('appealGrounds');
		expect(hasAppCaseOutput).not.toHaveProperty('enforcementNotice');

		expect(s78AppCaseOutput).toHaveProperty('appellantProcedurePreference');
		expect(s78AppCaseOutput).toHaveProperty('agriculturalHolding');
		expect(s78AppCaseOutput).toHaveProperty('developmentDescription');
		expect(s78AppCaseOutput).toHaveProperty('planningObligation');
	});

	test('should only map the lpaq fields for LDC', async () => {
		const appealLDC = {
			...mocks.ldcAppeal,
			folders: []
		};

		// @ts-ignore
		const ldcAppCaseOutput = mapCase({ appeal: appealLDC, context: contextEnum.lpaQuestionnaire });

		expect(ldcAppCaseOutput).toHaveProperty('hasInfrastructureLevy');
		expect(ldcAppCaseOutput).toHaveProperty('isInfrastructureLevyFormallyAdopted');
		expect(ldcAppCaseOutput).toHaveProperty('infrastructureLevyAdoptedDate');
		expect(ldcAppCaseOutput).toHaveProperty('infrastructureLevyExpectedDate');

		expect(ldcAppCaseOutput).toHaveProperty('reasonForNeighbourVisits');

		expect(ldcAppCaseOutput).toHaveProperty('lpaProcedurePreference');
		expect(ldcAppCaseOutput).toHaveProperty('lpaProcedurePreferenceDetails');
		expect(ldcAppCaseOutput).toHaveProperty('lpaProcedurePreferenceDuration');

		expect(ldcAppCaseOutput).toHaveProperty('appealUnderActSection');
		expect(ldcAppCaseOutput).toHaveProperty('lpaConsiderAppealInvalid');
		expect(ldcAppCaseOutput).toHaveProperty('lpaAppealInvalidReasons');

		expect(ldcAppCaseOutput).not.toHaveProperty('planningObligation');
	});
});

describe('appeals integration mappers', () => {
	test('should map the correct data for the selected context', async () => {
		const appealEnforcement = {
			...mocks.enforcementAppeal,
			folders: []
		};

		const enforcementAppCaseOutput = mapCase({
			// @ts-ignore
			appeal: appealEnforcement,
			context: contextEnum.broadcast
		});

		expect(enforcementAppCaseOutput).toHaveProperty('enforcementNotice', true);
		expect(enforcementAppCaseOutput).toHaveProperty('ownerOccupancyStatus', 'Owner');
		expect(enforcementAppCaseOutput).toHaveProperty('enforcementAppealGroundsDetails', [
			{ appealGroundLetter: 'a', groundFacts: 'The site is in a conservation area' }
		]);
		expect(enforcementAppCaseOutput).toHaveProperty(
			'applicationPartOrWholeDevelopment',
			'all-of-the-development'
		);
		expect(enforcementAppCaseOutput).toHaveProperty('occupancyConditionsMet', true);
		expect(enforcementAppCaseOutput).toHaveProperty(
			'effectiveDateOfEnforcementNotice',
			'2024-10-17T14:08:50.409Z'
		);
		expect(enforcementAppCaseOutput).toHaveProperty(
			'issueDateOfEnforcementNotice',
			'2024-10-16T14:08:50.409Z'
		);
	});
});
