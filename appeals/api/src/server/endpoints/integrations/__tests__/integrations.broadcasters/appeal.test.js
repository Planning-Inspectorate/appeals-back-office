// @ts-nocheck
import { producers } from '#infrastructure/topics.js';
import { fullPlanningAppeal, householdAppeal } from '#tests/appeals/mocks.js';
import { jest } from '@jest/globals';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { broadcastAppeal } from '../../integrations.broadcasters/appeal.js';
const { databaseConnector } = await import('#utils/database-connector.js');

describe('broadcastAppeal', () => {
	const caseTypes = [
		{
			type: APPEAL_CASE_TYPE.D,
			expectedTopic: producers.boCaseData,
			mockAppeal: householdAppeal
		},
		{
			type: APPEAL_CASE_TYPE.ZP,
			expectedTopic: producers.boCaseData,
			mockAppeal: householdAppeal
		},
		{
			type: APPEAL_CASE_TYPE.H,
			expectedTopic: producers.boCaseDataS78,
			mockAppeal: fullPlanningAppeal
		},
		{
			type: APPEAL_CASE_TYPE.ZA,
			expectedTopic: producers.boCaseData,
			mockAppeal: householdAppeal
		},
		{
			type: APPEAL_CASE_TYPE.W,
			expectedTopic: producers.boCaseDataS78,
			mockAppeal: fullPlanningAppeal
		},
		{
			type: APPEAL_CASE_TYPE.Y,
			expectedTopic: producers.boCaseDataS78,
			mockAppeal: fullPlanningAppeal
		},
		{
			type: APPEAL_CASE_TYPE.C,
			expectedTopic: producers.boCaseDataS78,
			mockAppeal: fullPlanningAppeal
		}
	];

	beforeEach(() => {
		jest.clearAllMocks();
	});

	const expeditedCaseTypes = caseTypes.filter((c) => c.type === APPEAL_CASE_TYPE.W);
	const standardCaseTypes = caseTypes.filter((c) => c.type !== APPEAL_CASE_TYPE.W);

	it.each(expeditedCaseTypes)(
		'broadcasts correct schema and topic for expedited appeal type %s',
		async ({ type, expectedTopic, mockAppeal }) => {
			const testCase = structuredClone(mockAppeal);
			// @ts-ignore
			testCase.appealType = { key: type };

			testCase.appellantCase.reasonForAppealAppellant = 'S78 reason';
			testCase.appellantCase.anySignificantChanges = 'Yes';
			testCase.appellantCase.anySignificantChanges_localPlanSignificantChanges = 'lp changes';
			testCase.appellantCase.screeningOpinionIndicatesEiaRequired = true;
			testCase.appellantCase.ownershipCertificate = true;

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(testCase);

			await broadcastAppeal(123);

			const expectedFields = {
				reasonForAppealAppellant: expect.any(String),
				screeningOpinionIndicatesEiaRequired: expect.any(Boolean),
				ownershipCertificate: expect.any(Boolean),
				significantChangesAffectingApplicationAppellant: expect.any(Array)
			};

			// @ts-ignore
			expect(global.mockSendEvents).toHaveBeenCalledWith(
				expectedTopic,
				expect.arrayContaining([expect.objectContaining(expectedFields)]),
				expect.any(String),
				expect.any(Object)
			);
		}
	);

	it.each(standardCaseTypes)(
		'broadcasts correct schema and topic for appeal type %s',
		async ({ type, expectedTopic, mockAppeal }) => {
			const testCase = structuredClone(mockAppeal);
			// @ts-ignore
			testCase.appealType = { key: type };

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(testCase);

			await broadcastAppeal(123);

			// @ts-ignore
			expect(global.mockSendEvents).toHaveBeenCalledWith(
				expectedTopic,
				expect.arrayContaining([expect.objectContaining({})]),
				expect.any(String),
				expect.any(Object)
			);

			// @ts-ignore
			const sentEvent = global.mockSendEvents.mock.calls[0][1][0];

			expect(sentEvent).not.toHaveProperty('reasonForAppealAppellant');
			expect(sentEvent).not.toHaveProperty('screeningOpinionIndicatesEiaRequired');
			expect(sentEvent).not.toHaveProperty('ownershipCertificate');
			expect(sentEvent).not.toHaveProperty('significantChangesAffectingApplicationAppellant');
		}
	);

	it('does not broadcast significant changes details if anySignificantChanges is No', async () => {
		const testCase = structuredClone(fullPlanningAppeal);
		// @ts-ignore
		testCase.appealType = { key: APPEAL_CASE_TYPE.W };
		testCase.appellantCase.reasonForAppealAppellant = 'S78 reason';
		testCase.appellantCase.anySignificantChanges = 'No';
		testCase.appellantCase.anySignificantChanges_localPlanSignificantChanges = 'Should be ignored';
		testCase.appellantCase.screeningOpinionIndicatesEiaRequired = true;
		testCase.appellantCase.ownershipCertificate = true;

		// @ts-ignore
		databaseConnector.appeal.findUnique.mockResolvedValue(testCase);

		await broadcastAppeal(123);

		// @ts-ignore
		const sentEvent = global.mockSendEvents.mock.calls[0][1][0];
		expect(sentEvent.significantChangesAffectingApplicationAppellant).toEqual([]);
	});

	it('does not broadcast if appeal not found', async () => {
		// @ts-ignore
		databaseConnector.appeal.findUnique.mockResolvedValue(null);
		await broadcastAppeal(1);
		// @ts-ignore
		expect(global.mockSendEvents).not.toHaveBeenCalled();
	});

	it('does not broadcast if validation fails', async () => {
		const appeal = {
			id: 1,
			parentAppeals: [],
			childAppeals: [],
			appealType: { key: APPEAL_CASE_TYPE.D }
		};
		// @ts-ignore
		databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
		await broadcastAppeal(123);
		// @ts-ignore
		expect(global.mockSendEvents).not.toHaveBeenCalled();
	});
});
