// @ts-nocheck
import { getStartCaseNotifyParams } from '#endpoints/appeal-timetables/appeal-timetables.service.js';
import { fullPlanningAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { expect, jest } from '@jest/globals';
import { PROCEDURE_TYPE_KEY } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('getStartCaseNotifyParams Unit Tests', () => {
	const startDate = '2024-06-12T22:59:00.000Z';
	const siteAddress = '123 Test Street, London';
	const timetable = {
		lpaQuestionnaireDueDate: '2024-06-19T22:59:00.000Z',
		lpaStatementDueDate: '2024-07-17T22:59:00.000Z',
		ipCommentsDueDate: '2024-07-17T22:59:00.000Z',
		finalCommentsDueDate: '2024-07-31T22:59:00.000Z',
		statementOfCommonGroundDueDate: '2024-07-17T22:59:00.000Z',
		commentDeadline: '2024-07-17T22:59:00.000Z',
		planningObligationDueDate: '2024-07-14T22:59:00.000Z',
		proofOfEvidenceAndWitnessesDueDate: '2024-05-13T00:00:00.000Z',
		caseManagementConferenceDueDate: '2024-05-15T00:00:00.000Z'
	};
	const notifyClient = {};
	const inquiry = {
		inquiryStartTime: '2024-06-12T12:00:00.000Z',
		inquiryAddress: '123 Inquiry Place, London',
		inquiryEstimationDays: 5,
		timetable
	};

	const defaultAppeal = {
		...fullPlanningAppeal,
		appealType: { key: APPEAL_CASE_TYPE.W, type: 'W' },
		appellant: { email: 'appellant@test.com' },
		lpa: { email: 'lpa@test.com' }
	};

	beforeEach(() => {
		jest.clearAllMocks();
		databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);
	});

	describe('Template Name Resolution', () => {
		test.each([
			[
				'Inquiry (initial start)',
				{ procedureType: APPEAL_CASE_PROCEDURE.INQUIRY, inquiry },
				'appeal-valid-start-case-s78-inquiry',
				'appeal-valid-start-case-s78-inquiry'
			],
			[
				'Hearing without start time (initial start)',
				{ procedureType: APPEAL_CASE_PROCEDURE.HEARING },
				'appeal-valid-start-case-s78-appellant',
				'appeal-valid-start-case-s78-lpa'
			],
			[
				'Hearing with start time (initial start)',
				{
					procedureType: APPEAL_CASE_PROCEDURE.HEARING,
					hearingStartTime: '2024-06-12T12:00:00.000Z'
				},
				'appeal-valid-start-case-s78-hearing-appellant',
				'appeal-valid-start-case-s78-hearing-lpa'
			],
			[
				'Written Part 1 (initial start)',
				{ procedureType: APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 },
				'appeal-valid-start-case-s78-expedited-appellant',
				'appeal-valid-start-case-s78-expedited-lpa'
			],
			[
				'PROCEDURE_TYPE_KEY.WRITTEN_PART_1 (initial start)',
				{ procedureType: PROCEDURE_TYPE_KEY.WRITTEN_PART_1 },
				'appeal-valid-start-case-s78-expedited-appellant',
				'appeal-valid-start-case-s78-expedited-lpa'
			],
			[
				'Written (initial start)',
				{ procedureType: APPEAL_CASE_PROCEDURE.WRITTEN },
				'appeal-valid-start-case-s78-appellant',
				'appeal-valid-start-case-s78-lpa'
			],
			[
				'Inquiry (start date change)',
				{
					procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
					inquiry,
					caseStartedDate: '2024-06-01T22:59:00.000Z'
				},
				'appeal-start-date-change-inquiry',
				'appeal-start-date-change-inquiry'
			],
			[
				'Hearing (start date change)',
				{
					procedureType: APPEAL_CASE_PROCEDURE.HEARING,
					hearingStartTime: '2024-06-12T12:00:00.000Z',
					caseStartedDate: '2024-06-01T22:59:00.000Z'
				},
				'appeal-start-date-change-appellant',
				'appeal-start-date-change-lpa'
			],
			[
				'Written Part 1 (start date change)',
				{
					procedureType: APPEAL_CASE_PROCEDURE.WRITTEN_PART_1,
					caseStartedDate: '2024-06-01T22:59:00.000Z'
				},
				'appeal-start-date-change-expedited-appellant',
				'appeal-start-date-change-expedited-lpa'
			],
			[
				'Written (start date change)',
				{
					procedureType: APPEAL_CASE_PROCEDURE.WRITTEN,
					caseStartedDate: '2024-06-01T22:59:00.000Z'
				},
				'appeal-start-date-change-appellant',
				'appeal-start-date-change-lpa'
			]
		])(
			'resolves template names for %s',
			async (_, params, expectedAppellantTemplate, expectedLpaTemplate) => {
				const appeal = {
					...defaultAppeal,
					...(params.caseStartedDate && { caseStartedDate: params.caseStartedDate })
				};

				const result = await getStartCaseNotifyParams({
					appeal,
					startDate,
					notifyClient,
					siteAddress,
					azureAdUserId,
					timetable,
					procedureType: params.procedureType,
					hearingStartTime: params.hearingStartTime,
					inquiry: params.inquiry
				});

				expect(result.appellant.templateName).toBe(expectedAppellantTemplate);
				expect(result.lpa.templateName).toBe(expectedLpaTemplate);
			}
		);
	});

	describe('Recipient Email Filtering', () => {
		test.each([
			[
				'appellant only when LPA email is missing',
				{ appellant: { email: 'appellant@test.com' }, lpa: { email: null } },
				{ hasAppellant: true, hasLpa: false, recipientEmail: 'appellant@test.com' }
			],
			[
				'agent email when appellant email is missing',
				{ appellant: { email: null }, agent: { email: 'agent@test.com' }, lpa: { email: null } },
				{ hasAppellant: true, hasLpa: false, recipientEmail: 'agent@test.com' }
			],
			[
				'LPA only when appellant/agent emails missing',
				{ appellant: { email: null }, agent: { email: null }, lpa: { email: 'lpa@test.com' } },
				{ hasAppellant: false, hasLpa: true }
			],
			[
				'empty object when no emails are present',
				{ appellant: { email: null }, agent: { email: null }, lpa: { email: null } },
				{ hasAppellant: false, hasLpa: false }
			]
		])('returns %s', async (_, emailConfig, expected) => {
			const appeal = {
				...fullPlanningAppeal,
				...emailConfig
			};

			const result = await getStartCaseNotifyParams({
				appeal,
				startDate,
				notifyClient,
				siteAddress,
				azureAdUserId,
				timetable,
				procedureType: APPEAL_CASE_PROCEDURE.WRITTEN
			});

			expect(Boolean(result.appellant)).toBe(expected.hasAppellant);
			expect(Boolean(result.lpa)).toBe(expected.hasLpa);
			expect(result.appellant?.recipientEmail).toBe(expected.recipientEmail);
		});
	});

	describe('Personalisation Logic & Flags', () => {
		test.each([
			[APPEAL_CASE_PROCEDURE.WRITTEN, true, true],
			[APPEAL_CASE_PROCEDURE.WRITTEN_PART_1, true, true],
			[APPEAL_CASE_PROCEDURE.HEARING, false, false],
			[APPEAL_CASE_PROCEDURE.INQUIRY, false, false]
		])(
			'sets site_visit and costs_info correctly for procedure %s',
			async (procedureType, expectedSiteVisit, expectedCostsInfo) => {
				const result = await getStartCaseNotifyParams({
					appeal: defaultAppeal,
					startDate,
					notifyClient,
					siteAddress,
					azureAdUserId,
					timetable,
					procedureType,
					...(procedureType === APPEAL_CASE_PROCEDURE.INQUIRY && { inquiry })
				});

				expect(result.appellant.personalisation.site_visit).toBe(expectedSiteVisit);
				expect(result.appellant.personalisation.costs_info).toBe(expectedCostsInfo);
			}
		);

		test('includes S78 specific LPA deadlines when appeal type key is W', async () => {
			const result = await getStartCaseNotifyParams({
				appeal: defaultAppeal,
				startDate,
				notifyClient,
				siteAddress,
				azureAdUserId,
				timetable,
				procedureType: APPEAL_CASE_PROCEDURE.WRITTEN
			});

			expect(result.lpa.personalisation).toHaveProperty('statement_of_common_ground_deadline');
			expect(result.lpa.personalisation).toHaveProperty('planning_obligation_deadline');
		});

		test('includes enforcement grounds and reference when case type is enforcement', async () => {
			const appeal = {
				...defaultAppeal,
				appealType: { key: APPEAL_CASE_TYPE.C, type: 'C' },
				appellantCase: { enforcementReference: 'ENF/123/456', planningObligation: true },
				appealGrounds: [{ ground: { groundRef: 'a' } }, { ground: { groundRef: 'f' } }]
			};

			const result = await getStartCaseNotifyParams({
				appeal,
				startDate,
				notifyClient,
				siteAddress,
				azureAdUserId,
				timetable,
				procedureType: APPEAL_CASE_PROCEDURE.WRITTEN
			});

			expect(result.appellant.personalisation.enforcement_reference).toBe('ENF/123/456');
			expect(result.appellant.personalisation.appeal_grounds).toEqual(['a', 'f']);
			expect(result.appellant.personalisation).toHaveProperty('planning_obligation_deadline');
		});
	});
});
