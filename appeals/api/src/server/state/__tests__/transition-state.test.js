// @ts-nocheck
import appealRepository from '#repositories/appeal.repository.js';
import { jest } from '@jest/globals';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import {
	CASE_RELATIONSHIP_LINKED,
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_INCOMPLETE,
	VALIDATION_OUTCOME_VALID
} from '@pins/appeals/constants/support.js';
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE
} from '@planning-inspectorate/data-model';
import transitionState, {
	getEventElapsed,
	transitionLinkedChildAppealsState
} from '../transition-state.js';
const { databaseConnector } = await import('#utils/database-connector.js');
const appealStatusRepository = (await import('#repositories/appeal-status.repository.js')).default;
const representationRepository = (await import('#repositories/representation.repository.js'))
	.default;
const oneDayinMS = 90000000; // 25 hours

describe('transitionState', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

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
			databaseConnector.$executeRawUnsafe.mockResolvedValue({});
			// @ts-ignore
			databaseConnector.appealStatus.update.mockResolvedValue({});
		});
		test('updates state to ready_to_start and updates personal list', async () => {
			const result = await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);
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
			expect(result).toEqual(true);
		});

		test.each(stateList)(
			'handles transition correctly from %s',
			async ({ status, expectUpdate, expectCreate }) => {
				const dynamicFixture = {
					...appealFixture,
					appealStatus: [{ status, valid: true }]
				};

				jest.spyOn(representationRepository, 'getRepresentations').mockImplementation(jest.fn());
				databaseConnector.appeal.findUnique.mockResolvedValue(dynamicFixture);

				const result = await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);

				expect(databaseConnector.appealStatus.updateMany).toHaveBeenCalledTimes(
					expectUpdate ? 1 : 0
				);

				expect(databaseConnector.appealStatus.create).toHaveBeenCalledTimes(expectCreate ? 1 : 0);

				expect(databaseConnector.$executeRawUnsafe).toHaveBeenCalledTimes(1);
				expect(result).toEqual(expectUpdate);
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
			jest
				.spyOn(appealStatusRepository, 'updateAppealStatusByAppealId')
				.mockImplementation(jest.fn());
			jest.spyOn(appealStatusRepository, 'rollBackAppealStatusTo').mockImplementation(jest.fn());
			// @ts-ignore
			databaseConnector.$executeRawUnsafe = jest.fn().mockResolvedValue({});
		};);
		test('does not update status but updates personal list', async () => {
			const result = await transitionState(22, 'user-xyz', VALIDATION_OUTCOME_INCOMPLETE);
			expect(appealStatusRepository.updateAppealStatusByAppealId).not.toHaveBeenCalled();
			expect(appealStatusRepository.rollBackAppealStatusTo).not.toHaveBeenCalled();
			expect(databaseConnector.$executeRawUnsafe).toHaveBeenCalled();
			expect(result).toEqual(false);
		});

		describe('Expedited Appeals (HAS)', () => {
			test('handles HAS appeal type correctly', async () => {
				const hasAppeal = {
					...appealFixture,
					appealType: { key: APPEAL_CASE_TYPE.Y }
				};
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(hasAppeal);

				const result = await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);

				expect(appealStatusRepository.updateAppealStatusByAppealId).toHaveBeenCalled();
				expect(result).toEqual(true);
			});

			test('transitions a WRITTEN_PART_1 appeal with arranged site visit from event to awaiting_event', async () => {
				const expeditedAppeal = {
					...appealFixture,
					appealStatus: [{ status: 'lpa_questionnaire', valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.D },
					procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 },
					siteVisit: {
						visitDate: new Date(Date.now() + oneDayinMS).toISOString()
					}
				};

				let callCount = 0;
				databaseConnector.appeal.findUnique.mockImplementation(() => {
					callCount++;
					if (callCount === 1) {
						return Promise.resolve(expeditedAppeal);
					}
					return Promise.resolve({
						...expeditedAppeal,
						appealStatus: [{ status: 'event', valid: true }]
					});
				});

				const result = await transitionState(11, 'user-123', VALIDATION_OUTCOME_COMPLETE);

				expect(appealStatusRepository.updateAppealStatusByAppealId).toHaveBeenNthCalledWith(
					1,
					11,
					'event'
				);
				expect(appealStatusRepository.updateAppealStatusByAppealId).toHaveBeenNthCalledWith(
					2,
					11,
					'awaiting_event'
				);
				expect(result).toEqual(true);
			});

			test('transitions a S78 expedited (W + WRITTEN_PART_1) appeal with arranged site visit from event to awaiting_event', async () => {
				const expeditedAppeal = {
					...appealFixture,
					appealStatus: [{ status: 'lpa_questionnaire', valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 },
					siteVisit: {
						visitDate: new Date(Date.now() + oneDayinMS).toISOString()
					}
				};

				let callCount = 0;
				databaseConnector.appeal.findUnique.mockImplementation(() => {
					callCount++;
					if (callCount === 1) {
						return Promise.resolve(expeditedAppeal);
					}
					return Promise.resolve({
						...expeditedAppeal,
						appealStatus: [{ status: 'event', valid: true }]
					});
				});

				const result = await transitionState(11, 'user-123', VALIDATION_OUTCOME_COMPLETE);

				expect(appealStatusRepository.updateAppealStatusByAppealId).toHaveBeenNthCalledWith(
					1,
					11,
					'event'
				);
				expect(appealStatusRepository.updateAppealStatusByAppealId).toHaveBeenNthCalledWith(
					2,
					11,
					'awaiting_event'
				);
				expect(result).toEqual(true);
			});

			test.each([
				{
					type: APPEAL_CASE_TYPE.W,
					procedure: APPEAL_CASE_PROCEDURE.WRITTEN_PART_1,
					description: 'S78 expedited (W + WRITTEN_PART_1)'
				},
				{
					type: APPEAL_CASE_TYPE.D,
					procedure: APPEAL_CASE_PROCEDURE.WRITTEN,
					description: 'HAS (D + WRITTEN)'
				},
				{
					type: APPEAL_CASE_TYPE.ZA,
					procedure: APPEAL_CASE_PROCEDURE.WRITTEN,
					description: 'CAS Advert (ZA + WRITTEN)'
				},
				{
					type: APPEAL_CASE_TYPE.ZP,
					procedure: APPEAL_CASE_PROCEDURE.WRITTEN,
					description: 'CAS Planning (ZP + WRITTEN)'
				}
			])(
				'transitions a $description appeal with arranged site visit in the past from lpaq to issue_determination',
				async ({ type, procedure }) => {
					const expeditedAppeal = {
						...appealFixture,
						appealStatus: [{ status: 'lpa_questionnaire', valid: true }],
						appealType: { key: type },
						procedureType: { key: procedure },
						siteVisit: {
							visitDate: new Date(Date.now() - oneDayinMS).toISOString()
						}
					};

					databaseConnector.appeal.findUnique.mockResolvedValue(expeditedAppeal);

					const result = await transitionState(11, 'user-123', VALIDATION_OUTCOME_COMPLETE);

					expect(appealStatusRepository.updateAppealStatusByAppealId).toHaveBeenCalledWith(
						11,
						'issue_determination'
					);
					expect(appealStatusRepository.updateAppealStatusByAppealId).toHaveBeenCalledTimes(1);
					expect(result).toEqual(true);
				}
			);

			test.each([
				{
					type: APPEAL_CASE_TYPE.W,
					procedure: APPEAL_CASE_PROCEDURE.WRITTEN_PART_1,
					description: 'S78 expedited (W + WRITTEN_PART_1)'
				},
				{
					type: APPEAL_CASE_TYPE.D,
					procedure: APPEAL_CASE_PROCEDURE.WRITTEN,
					description: 'HAS (D + WRITTEN)'
				},
				{
					type: APPEAL_CASE_TYPE.ZA,
					procedure: APPEAL_CASE_PROCEDURE.WRITTEN,
					description: 'CAS Advert (ZA + WRITTEN)'
				},
				{
					type: APPEAL_CASE_TYPE.ZP,
					procedure: APPEAL_CASE_PROCEDURE.WRITTEN,
					description: 'CAS Planning (ZP + WRITTEN)'
				}
			])(
				'transitions a $description appeal from lpaq to event if site visit is not scheduled',
				async ({ type, procedure }) => {
					const expeditedAppeal = {
						...appealFixture,
						appealStatus: [{ status: 'lpa_questionnaire', valid: true }],
						appealType: { key: type },
						procedureType: { key: procedure },
						siteVisit: null
					};

					databaseConnector.appeal.findUnique.mockResolvedValue(expeditedAppeal);

					const result = await transitionState(11, 'user-123', VALIDATION_OUTCOME_COMPLETE);

					expect(appealStatusRepository.updateAppealStatusByAppealId).toHaveBeenCalledWith(
						11,
						'event'
					);
					expect(appealStatusRepository.updateAppealStatusByAppealId).toHaveBeenCalledTimes(1);
					expect(result).toEqual(true);
				}
			);
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

				const result = await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);

				expect(databaseConnector.$executeRawUnsafe).not.toHaveBeenCalled();
				expect(result).toEqual(true);
			});

			test('updates personal list for non-child appeals', async () => {
				const result = await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);

				expect(databaseConnector.$executeRawUnsafe).toHaveBeenCalled();
				expect(result).toEqual(true);
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

				const result = await transitionLinkedChildAppealsState(
					parentAppeal,
					'user-123',
					VALIDATION_OUTCOME_VALID
				);

				expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith(
					expect.objectContaining({
						where: { id: 11 }
					})
				);
				expect(result).toEqual(parentAppeal.childAppeals.map((child) => child.childId));
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

				const result = await transitionLinkedChildAppealsState(
					parentAppeal,
					'user-123',
					VALIDATION_OUTCOME_VALID
				);

				expect(databaseConnector.appeal.findUnique).not.toHaveBeenCalled();
				expect(result).toEqual([]);
			});
		});
	});

	describe('transitionState repository call', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			jest.spyOn(appealRepository, 'getAppealById').mockResolvedValue(appealFixture);
		});

		test('calls getAppealById with only required fields', async () => {
			const result = await transitionState(11, 'user-123', VALIDATION_OUTCOME_VALID);
			expect(appealRepository.getAppealById).toHaveBeenCalledWith(11, true, [
				'appealStatus',
				'appealType',
				'procedureType',
				'siteVisit',
				'hearing',
				'inquiry',
				'childAppeals'
			]);
			expect(result).toEqual(true);
		});
	});

	describe('Transition to EVENT / AWAITING_EVENT / ISSUE_DETERMINATION from preceding states', () => {
		const runTransitionTest = async (mockAppeal, mockRepresentations) => {
			const currentAppeal = { ...mockAppeal };
			currentAppeal.appealStatus = mockAppeal.appealStatus.map((s) => ({ ...s }));

			jest.spyOn(appealRepository, 'getAppealById').mockImplementation(() => {
				return Promise.resolve(currentAppeal);
			});

			const appealStatusCreateMock = jest.fn().mockImplementation(({ data }) => {
				currentAppeal.appealStatus = currentAppeal.appealStatus.map((s) => ({
					...s,
					valid: false
				}));
				currentAppeal.appealStatus.push({ status: data.status, valid: true });
				return Promise.resolve({});
			});

			Object.defineProperty(databaseConnector, 'appealStatus', {
				get: () => ({
					updateMany: jest.fn().mockResolvedValue({}),
					create: appealStatusCreateMock
				}),
				configurable: true
			});

			if (mockRepresentations) {
				jest
					.spyOn(representationRepository, 'getRepresentations')
					.mockResolvedValue(mockRepresentations);
			}

			await transitionState(mockAppeal.id, 'user-123', VALIDATION_OUTCOME_COMPLETE);
			return appealStatusCreateMock;
		};

		afterEach(() => {
			// @ts-ignore
			delete databaseConnector.appealStatus;
		});

		const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
		const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
		const standardRepresentations = {
			comments: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				}
			]
		};

		const testCases = [
			{
				description: 'transitions from final_comments to event when no site visit exists (written)',
				expectedStatus: APPEAL_CASE_STATUS.EVENT,
				appeal: {
					id: 100,
					appealStatus: [{ status: APPEAL_CASE_STATUS.FINAL_COMMENTS, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN },
					siteVisit: null
				}
			},
			{
				description:
					'transitions from final_comments to event when site visit exists with null date (written)',
				expectedStatus: APPEAL_CASE_STATUS.EVENT,
				appeal: {
					id: 101,
					appealStatus: [{ status: APPEAL_CASE_STATUS.FINAL_COMMENTS, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN },
					siteVisit: { visitDate: null }
				}
			},
			{
				description:
					'transitions from final_comments to awaiting_event when site visit exists with future date (written)',
				expectedStatus: APPEAL_CASE_STATUS.AWAITING_EVENT,
				appeal: {
					id: 102,
					appealStatus: [{ status: APPEAL_CASE_STATUS.FINAL_COMMENTS, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN },
					siteVisit: { visitDate: futureDate }
				}
			},
			{
				description:
					'transitions from final_comments directly to issue_determination when site visit is in the past (written)',
				expectedStatus: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				appeal: {
					id: 103,
					appealStatus: [{ status: APPEAL_CASE_STATUS.FINAL_COMMENTS, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN },
					siteVisit: { visitDate: pastDate }
				}
			},
			{
				description: 'transitions from statements to event when no hearing exists (hearing)',
				expectedStatus: APPEAL_CASE_STATUS.EVENT,
				appeal: {
					id: 200,
					appealStatus: [{ status: APPEAL_CASE_STATUS.STATEMENTS, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.HEARING },
					hearing: null
				}
			},
			{
				description:
					'transitions from statements to awaiting_event when hearing has address and future date',
				expectedStatus: APPEAL_CASE_STATUS.AWAITING_EVENT,
				appeal: {
					id: 201,
					appealStatus: [{ status: APPEAL_CASE_STATUS.STATEMENTS, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.HEARING },
					hearing: { addressId: 1, hearingStartTime: futureDate }
				}
			},
			{
				description: 'transitions from statements to awaiting_event when hearing is in the past',
				expectedStatus: APPEAL_CASE_STATUS.AWAITING_EVENT,
				appeal: {
					id: 202,
					appealStatus: [{ status: APPEAL_CASE_STATUS.STATEMENTS, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.HEARING },
					hearing: { addressId: 1, hearingStartTime: pastDate }
				}
			},
			{
				description:
					'transitions from lpa_questionnaire to event when no site visit exists (HAS / written)',
				expectedStatus: APPEAL_CASE_STATUS.EVENT,
				appeal: {
					id: 300,
					appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.D },
					procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN },
					siteVisit: null
				}
			},
			{
				description:
					'transitions from lpa_questionnaire to event when site visit exists with null date (HAS / written)',
				expectedStatus: APPEAL_CASE_STATUS.EVENT,
				appeal: {
					id: 301,
					appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.D },
					procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN },
					siteVisit: { visitDate: null }
				}
			},
			{
				description:
					'transitions from lpa_questionnaire to awaiting_event when site visit exists with future date (HAS / written)',
				expectedStatus: APPEAL_CASE_STATUS.AWAITING_EVENT,
				appeal: {
					id: 302,
					appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.D },
					procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN },
					siteVisit: { visitDate: futureDate }
				}
			},
			{
				description:
					'transitions from lpa_questionnaire directly to issue_determination when site visit is in the past (HAS / written)',
				expectedStatus: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				appeal: {
					id: 303,
					appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.D },
					procedureType: { key: APPEAL_CASE_PROCEDURE.WRITTEN },
					siteVisit: { visitDate: pastDate }
				}
			},
			{
				description: 'transitions from evidence to event when no inquiry exists (inquiry)',
				expectedStatus: APPEAL_CASE_STATUS.EVENT,
				mockRepresentations: standardRepresentations,
				appeal: {
					id: 400,
					appealStatus: [{ status: APPEAL_CASE_STATUS.EVIDENCE, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.INQUIRY },
					inquiry: null
				}
			},
			{
				description:
					'transitions from evidence to awaiting_event when inquiry has address and future date',
				expectedStatus: APPEAL_CASE_STATUS.AWAITING_EVENT,
				mockRepresentations: standardRepresentations,
				appeal: {
					id: 401,
					appealStatus: [{ status: APPEAL_CASE_STATUS.EVIDENCE, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.INQUIRY },
					inquiry: { addressId: 1, inquiryStartTime: futureDate }
				}
			},
			{
				description: 'transitions from evidence to awaiting_event when inquiry is in the past',
				expectedStatus: APPEAL_CASE_STATUS.AWAITING_EVENT,
				mockRepresentations: standardRepresentations,
				appeal: {
					id: 402,
					appealStatus: [{ status: APPEAL_CASE_STATUS.EVIDENCE, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.INQUIRY },
					inquiry: { addressId: 1, inquiryStartTime: pastDate }
				}
			},
			{
				description:
					'transitions from statements to event when hearing exists but has no addressId (hearing)',
				expectedStatus: APPEAL_CASE_STATUS.EVENT,
				appeal: {
					id: 203,
					appealStatus: [{ status: APPEAL_CASE_STATUS.STATEMENTS, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.HEARING },
					hearing: { addressId: null, hearingStartTime: futureDate }
				}
			},
			{
				description:
					'transitions from evidence to event when inquiry exists but has no addressId (inquiry)',
				expectedStatus: APPEAL_CASE_STATUS.EVENT,
				mockRepresentations: standardRepresentations,
				appeal: {
					id: 403,
					appealStatus: [{ status: APPEAL_CASE_STATUS.EVIDENCE, valid: true }],
					appealType: { key: APPEAL_CASE_TYPE.W },
					procedureType: { key: APPEAL_CASE_PROCEDURE.INQUIRY },
					inquiry: { addressId: null, inquiryStartTime: futureDate }
				}
			}
		];

		test.each(testCases)(
			'$description',
			async ({ appeal, expectedStatus, mockRepresentations }) => {
				const createMock = await runTransitionTest(appeal, mockRepresentations);
				expect(createMock).toHaveBeenCalledWith({
					data: expect.objectContaining({
						appealId: appeal.id,
						status: expectedStatus,
						valid: true
					})
				});
			}
		);
	});
});

describe('getEventElapsed', () => {
	const validAppealTypes = Object.keys(APPEAL_CASE_TYPE);
	const testCases = validAppealTypes.flatMap((appealTypeKey) => {
		return [
			{
				description: 'returns true if hearing has ended',
				appeal: {
					hearing: {
						hearingEndTime: new Date(Date.now() - oneDayinMS)
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.HEARING,
				expected: true
			},
			{
				description: 'returns false if hearing has not ended',
				appeal: {
					hearing: {
						hearingEndTime: new Date(Date.now() + oneDayinMS)
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.HEARING,
				expected: false
			},
			{
				description: 'returns true if hearing with no end time is in the past',
				appeal: {
					hearing: {
						hearingEndTime: null,
						hearingStartTime: new Date(Date.now() - oneDayinMS)
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.HEARING,
				expected: true
			},
			{
				description: 'returns false if hearing with no end time is today',
				appeal: {
					hearing: {
						hearingEndTime: null,
						hearingStartTime: new Date(Date.now())
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.HEARING,
				expected: false
			},
			{
				description: 'returns false if hearing with no end time is in the future',
				appeal: {
					hearing: {
						hearingEndTime: null,
						hearingStartTime: new Date(Date.now() + oneDayinMS)
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.HEARING,
				expected: false
			},

			{
				description: 'returns true if inquiry has ended',
				appeal: {
					inquiry: {
						inquiryEndTime: new Date(Date.now() - oneDayinMS)
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
				expected: true
			},
			{
				description: 'returns false if inquiry has not ended',
				appeal: {
					inquiry: {
						inquiryEndTime: new Date(Date.now() + oneDayinMS)
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
				expected: false
			},
			{
				description: 'returns true if inquiry with no end time is in the past',
				appeal: {
					inquiry: {
						inquiryEndTime: null,
						inquiryStartTime: new Date(Date.now() - oneDayinMS)
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
				expected: true
			},
			{
				description: 'returns false if inquiry with no end time is today',
				appeal: {
					inquiry: {
						inquiryEndTime: null,
						inquiryStartTime: new Date(Date.now())
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
				expected: false
			},
			{
				description: 'returns false if inquiry with no end time is in the future',
				appeal: {
					inquiry: {
						inquiryEndTime: null,
						inquiryStartTime: new Date(Date.now() + oneDayinMS)
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.INQUIRY,
				expected: false
			},

			{
				description: 'returns false if written and visit date is in the future',
				appeal: {
					siteVisit: {
						visitDate: new Date(Date.now() + oneDayinMS)
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.WRITTEN,
				expected: false
			},
			{
				description: 'returns false if written and visit date is now',
				appeal: {
					siteVisit: {
						visitDate: new Date(Date.now())
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.WRITTEN,
				expected: false
			},
			{
				description: 'returns true if written and visit date is in the past',
				appeal: {
					siteVisit: {
						visitDate: new Date(Date.now() - oneDayinMS)
					}
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.WRITTEN,
				expected: true
			},
			{
				description: 'returns false if written and no visit date',
				appeal: {
					siteVisit: null
				},
				appealType: { key: appealTypeKey },
				procedureType: APPEAL_CASE_PROCEDURE.WRITTEN,
				expected: false
			}
		];
	});

	testCases.push(
		{
			description: 'returns false if unknown procedure type',
			appeal: {},
			appealType: { key: APPEAL_CASE_TYPE.W },
			procedureType: 'unknown',
			expected: false
		},
		{
			description: 'returns false no case type',
			appeal: {},
			appealType: null,
			procedureType: 'unknown',
			expected: false
		}
	);
	test.each(testCases)('$description', ({ appeal, appealType, procedureType, expected }) => {
		const result = getEventElapsed(appeal, appealType, procedureType);
		expect(result).toEqual(expected);
	});
});
