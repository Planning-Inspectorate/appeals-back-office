// @ts-nocheck
import { request } from '#tests/../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import formatDate from '#utils/date-formatter.js';
import {
	ERROR_NOT_FOUND,
	ERROR_INVALID_APPEAL_STATE,
	ERROR_CANNOT_BE_EMPTY_STRING,
	ERROR_MUST_BE_STRING,
	FRONT_OFFICE_URL
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
const { databaseConnector } = await import('#utils/database-connector.js');

const appealTypes = [
	{ id: 1, shorthand: 'A', code: 'A', type: 'TYPE A', enabled: false },
	{ id: 2, shorthand: 'B', code: 'B', type: 'TYPE B', enabled: false }
];
const appealsWithValidStatus = [
	{
		...householdAppeal,
		appealStatus: [
			{
				status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				valid: true
			}
		]
	},
	{
		...householdAppeal,
		appealStatus: [
			{
				status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				valid: true
			}
		]
	}
];
const appealsWithInvalidStatus = [
	{
		...householdAppeal,
		appealStatus: [
			{
				status: APPEAL_CASE_STATUS.CLOSED,
				valid: true
			}
		]
	}
];

describe('appeal change type resubmit routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST', () => {
		test('returns 400 when date is in the past', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealsWithValidStatus[0]);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-change-request`)
				.send({
					newAppealTypeId: 1,
					newAppealTypeFinalDate: '2023-02-02'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});
		test('returns 400 when appeal type is not matched', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealsWithValidStatus[1]);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-change-request`)
				.send({
					newAppealTypeId: 12,
					newAppealTypeFinalDate: '2024-02-02'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealTypeId: ERROR_NOT_FOUND
				}
			});
		});
		test('returns 400 when appeal status is incorrect', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealsWithInvalidStatus[0]);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-change-request`)
				.send({
					newAppealTypeId: 1,
					newAppealTypeFinalDate: '2024-02-02'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					appealStatus: ERROR_INVALID_APPEAL_STATE
				}
			});
		});
		test('returns 200 when appeal status is correct', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-change-request`)
				.send({
					newAppealTypeId: 1,
					newAppealTypeFinalDate: '3000-02-05T00:00:00.000Z'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				data: {
					caseResubmittedTypeId: 1,
					caseUpdatedDate: expect.any(Date)
				},
				where: {
					id: householdAppeal.id
				}
			});

			expect(databaseConnector.appealTimetable.upsert).toHaveBeenCalledWith({
				create: {
					appealId: householdAppeal.id,
					caseResubmissionDueDate: new Date('3000-02-05T23:59:00.000Z')
				},
				update: {
					caseResubmissionDueDate: new Date('3000-02-05T23:59:00.000Z')
				},
				where: {
					appealId: householdAppeal.id
				},
				include: {
					appeal: true
				}
			});

			// eslint-disable-next-line no-undef
			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			// eslint-disable-next-line no-undef
			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				notifyClient: expect.anything(),
				personalisation: {
					existing_appeal_type: 'Householder',
					appeal_reference_number: '1345264',
					lpa_reference: '48269/APP/2021/1482',
					appeal_type: 'type a',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					url: FRONT_OFFICE_URL,
					due_date: formatDate(new Date('3000-02-05'), false)
				},
				recipientEmail: 'test@136s7.com',
				templateName: 'appeal-type-change-non-has'
			});

			expect(response.status).toEqual(200);
		});
	});
});

describe('appeal change type transfer routes', () => {
	describe('POST', () => {
		test('returns 400 when appeal type is not matched', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealsWithValidStatus[0]);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-request`)
				.send({
					newAppealTypeId: 12
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealTypeId: ERROR_NOT_FOUND
				}
			});
		});

		test('returns 400 when appeal status is incorrect', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appealsWithInvalidStatus[0]);
			// @ts-ignore
			databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-request`)
				.send({
					newAppealTypeId: 1
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					appealStatus: ERROR_INVALID_APPEAL_STATE
				}
			});
		});
	});
});

describe('appeal change type transfer confirmation routes', () => {
	describe('POST', () => {
		test('returns 400 when appeal status is invalid', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
						valid: true
					}
				]
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-confirmation`)
				.send({
					newAppealReference: 'A string'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					appealStatus: ERROR_INVALID_APPEAL_STATE
				}
			});
		});

		test('returns 400 when newAppealReference is null', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.AWAITING_TRANSFER,
						valid: true
					}
				]
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-confirmation`)
				.send({
					newAppealReference: null
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealReference: ERROR_MUST_BE_STRING
				}
			});
		});

		test('returns 400 when newAppealReference is empty', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.AWAITING_TRANSFER,
						valid: true
					}
				]
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-confirmation`)
				.send({
					newAppealReference: ''
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealReference: ERROR_CANNOT_BE_EMPTY_STRING
				}
			});
		});

		test('returns 400 when newAppealReference is not a string', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.AWAITING_TRANSFER,
						valid: true
					}
				]
			});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/appeal-transfer-confirmation`)
				.send({
					newAppealReference: 320
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealReference: ERROR_MUST_BE_STRING
				}
			});
		});
	});
});
