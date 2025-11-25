// @ts-nocheck
import { jest } from '@jest/globals';
import {
	CASE_RELATIONSHIP_LINKED,
	VALIDATION_OUTCOME_INCOMPLETE,
	VALIDATION_OUTCOME_VALID
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import transitionState, { transitionLinkedChildAppealsState } from '../transition-state.js';
const { databaseConnector } = await import('#utils/database-connector.js');
const appealStatusRepository = (await import('#repositories/appeal-status.repository.js')).default;
const representationRepository = (await import('#repositories/representation.repository.js'))
	.default;

describe('transitionState', () => {
	const stateList = [
		{
			status: 'validation',
			expectUpdate: true,
			expectCreate: true
		},
		{
			status: 'final_comments',
			expectUpdate: false,
			expectCreate: false
		},
		{
			status: 'lpa_questionnaire',
			expectUpdate: false,
			expectCreate: false
		},
		{
			status: 'statements',
			expectUpdate: false,
			expectCreate: false
		},
		{
			status: 'ready_to_start',
			expectUpdate: false,
			expectCreate: false
		}
	];

	const appealFixture = {
		id: 11,
		reference: 'APP/11',
		appealStatus: [
			{
				status: 'validation',
				valid: true
			}
		],
		appealType: { key: APPEAL_CASE_TYPE.W },
		procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN }
	};

	describe('transitionState (per-status rules)', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealFixture);
			// @ts-ignore
			databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
			// @ts-ignore
			databaseConnector.personalList.upsert.mockResolvedValue({});
			// @ts-ignore
			databaseConnector.appealStatus.update.mockResolvedValue({});
		});
		test('updates state to ready_to_start and updates personal list', async () => {
			await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);
			expect(databaseConnector.appealStatus.updateMany).toHaveBeenCalledWith({
				where: { appealId: 11 },
				data: { valid: false }
			});
			expect(databaseConnector.appealStatus.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					appealId: 11,
					status: 'ready_to_start',
					valid: true
				})
			});
		});

		test.each(stateList)(
			'handles transition correctly from %s',
			async ({ status, expectUpdate, expectCreate }) => {
				const dynamicFixture = {
					...appealFixture,
					appealStatus: [{ status, valid: true }]
				};

				representationRepository.getRepresentations = jest.fn();
				databaseConnector.appeal.findUnique.mockResolvedValue(dynamicFixture);

				await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);

				expect(databaseConnector.appealStatus.updateMany).toHaveBeenCalledTimes(
					expectUpdate ? 1 : 0
				);

				expect(databaseConnector.appealStatus.create).toHaveBeenCalledTimes(expectCreate ? 1 : 0);

				expect(databaseConnector.personalList.upsert).toHaveBeenCalledTimes(1);
			}
		);
	});

	describe('transitionState (no state change)', () => {
		const appealFixtureIncompleteDoesNotTransition = {
			id: 22,
			reference: 'APP/22',
			appealStatus: [
				{
					status: 'validation',
					valid: true
				}
			],
			appealType: { key: APPEAL_CASE_TYPE.W },
			procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN }
		};
		beforeEach(() => {
			jest.clearAllMocks();
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(
				appealFixtureIncompleteDoesNotTransition
			);
			// @ts-ignore
			appealStatusRepository.updateAppealStatusByAppealId = jest.fn();
			// @ts-ignore
			appealStatusRepository.rollBackAppealStatusTo = jest.fn();
			// @ts-ignore
			databaseConnector.personalList.upsert = jest.fn().mockResolvedValue({});
		});
		test('does not update status but updates personal list', async () => {
			await transitionState(22, 'user-xyz', VALIDATION_OUTCOME_INCOMPLETE);
			expect(appealStatusRepository.updateAppealStatusByAppealId).not.toHaveBeenCalled();
			expect(appealStatusRepository.rollBackAppealStatusTo).not.toHaveBeenCalled();
			expect(databaseConnector.personalList.upsert).toHaveBeenCalled();
		});

		describe('Expedited Appeals (HAS)', () => {
			test('handles HAS appeal type correctly', async () => {
				const hasAppeal = {
					...appealFixture,
					appealType: { key: APPEAL_CASE_TYPE.Y }
				};
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(hasAppeal);

				await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);

				expect(appealStatusRepository.updateAppealStatusByAppealId).toHaveBeenCalled();
			});
		});

		describe('Error Handling', () => {
			test('throws error when appeal not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(null);

				await expect(transitionState(999, 'user-123', VALIDATION_OUTCOME_VALID)).rejects.toThrow(
					'no appeal exists with ID: 999'
				);
			});

			test('throws error when appealStatus is missing', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					id: 11,
					appealStatus: null,
					appealType: { key: APPEAL_CASE_TYPE.W }
				});

				await expect(transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID)).rejects.toThrow(
					'appeal with ID 11 is missing fields required to transition state'
				);
			});

			test('throws error when appealType is missing', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					id: 11,
					appealStatus: [{ status: 'validation', valid: true }],
					appealType: null
				});

				await expect(transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID)).rejects.toThrow(
					'appeal with ID 11 is missing fields required to transition state'
				);
			});
		});

		describe('Child Appeals', () => {
			test('does not update personal list for child appeals', async () => {
				const childAppeal = {
					...appealFixture,
					parentAppeals: [
						{
							parentId: 10,
							type: CASE_RELATIONSHIP_LINKED
						}
					]
				};

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(childAppeal);
				// @ts-ignore
				databaseConnector.appealRelationship.findMany.mockResolvedValue([
					{
						parentId: 10,
						type: CASE_RELATIONSHIP_LINKED
					}
				]);

				await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);

				expect(databaseConnector.personalList.upsert).not.toHaveBeenCalled();
			});

			test('updates personal list for non-child appeals', async () => {
				await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);

				expect(databaseConnector.personalList.upsert).toHaveBeenCalled();
			});
		});

		describe('Linked Child Appeals', () => {
			test('transitions linked child appeals with same status', async () => {
				const parentAppeal = {
					...appealFixture,
					id: 10,
					childAppeals: [
						{
							childId: 11,
							type: CASE_RELATIONSHIP_LINKED,
							child: {
								id: 11,
								appealStatus: [{ status: 'validation', valid: true }],
								appealType: { key: APPEAL_CASE_TYPE.W },
								procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN }
							}
						}
					]
				};

				await transitionLinkedChildAppealsState(parentAppeal, 'user-123', VALIDATION_OUTCOME_VALID);

				expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith(
					expect.objectContaining({
						where: { id: 11 }
					})
				);
			});

			test('does not transition child appeals with different status', async () => {
				const parentAppeal = {
					...appealFixture,
					id: 10,
					appealStatus: [{ status: 'ready_to_start', valid: true }],
					childAppeals: [
						{
							childId: 11,
							type: CASE_RELATIONSHIP_LINKED,
							child: {
								id: 11,
								appealStatus: [{ status: 'validation', valid: true }],
								appealType: { key: APPEAL_CASE_TYPE.W },
								procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN }
							}
						}
					]
				};

				await transitionLinkedChildAppealsState(parentAppeal, 'user-123', VALIDATION_OUTCOME_VALID);

				expect(databaseConnector.appeal.findUnique).not.toHaveBeenCalled();
			});
		});
	});
});
