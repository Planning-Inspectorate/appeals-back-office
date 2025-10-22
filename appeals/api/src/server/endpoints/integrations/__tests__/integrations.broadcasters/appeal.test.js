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
			expectedTopic: producers.boCaseData,
			mockAppeal: householdAppeal
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
		}
	];

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it.each(caseTypes)(
		'broadcasts correct schema and topic for appeal type %s',
		async ({ expectedTopic, mockAppeal }) => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(mockAppeal);

			await broadcastAppeal(123);

			// @ts-ignore
			expect(global.mockSendEvents).toHaveBeenCalledWith(
				expectedTopic,
				expect.any(Array),
				expect.any(String),
				expect.any(Object)
			);
		}
	);

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
