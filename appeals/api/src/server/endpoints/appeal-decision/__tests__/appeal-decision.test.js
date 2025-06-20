// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { documentCreated } from '#tests/documents/mocks.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { add, sub } from 'date-fns';
import {
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_NOT_BE_IN_FUTURE,
	ERROR_CASE_OUTCOME_MUST_BE_ONE_OF,
	ERROR_INVALID_APPEAL_STATE
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import {
	recalculateDateIfNotBusinessDay,
	setTimeInTimeZone
} from '@pins/appeals/utils/business-days.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('appeal decision routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		process.env.FRONT_OFFICE_URL =
			'https://appeal-planning-decision.service.gov.uk/appeals/1345264';
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST', () => {
		test('returns 400 when outcome is not expected', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision`)
				.send({
					outcome: 'unexpected',
					documentDate: '2023-11-10',
					documentGuid: documentCreated.guid
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					outcome: ERROR_CASE_OUTCOME_MUST_BE_ONE_OF
				}
			});
		});
		test('returns 400 when outcome is invalid', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision`)
				.send({
					outcome: 'invalid',
					documentDate: '2023-11-10',
					documentGuid: documentCreated.guid
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					outcome: ERROR_CASE_OUTCOME_MUST_BE_ONE_OF
				}
			});
		});
		test('returns 400 when date is incorrect', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision`)
				.send({
					outcome: 'allowed',
					documentDate: '2023-13-10',
					documentGuid: documentCreated.guid
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					documentDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
				}
			});
		});
		test('returns 400 when date is in the future', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const tomorrow = add(new Date(), { days: 1 });
			const utcDate = setTimeInTimeZone(tomorrow, 0, 0);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision`)
				.send({
					outcome: 'allowed',
					documentDate: utcDate.toISOString(),
					documentGuid: documentCreated.guid
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					documentDate: ERROR_MUST_NOT_BE_IN_FUTURE
				}
			});
		});
		test('returns 400 when state is not correct', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const tenDaysAgo = sub(new Date(), { days: 10 });
			const withoutWeekends = await recalculateDateIfNotBusinessDay(tenDaysAgo.toISOString());
			const utcDate = setTimeInTimeZone(withoutWeekends, 0, 0);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision`)
				.send({
					outcome: 'allowed',
					documentDate: utcDate.toISOString(),
					documentGuid: documentCreated.guid
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					state: ERROR_INVALID_APPEAL_STATE
				}
			});
		});
		test('returns 200 when all good', async () => {
			const correctAppealState = {
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
						valid: true
					}
				]
			};
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(correctAppealState);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);
			// @ts-ignore
			databaseConnector.inspectorDecision.create.mockResolvedValue({});

			const tenDaysAgo = sub(new Date(), { days: 10 });
			const withoutWeekends = await recalculateDateIfNotBusinessDay(tenDaysAgo.toISOString());
			const utcDate = setTimeInTimeZone(withoutWeekends, 0, 0);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision`)
				.send({
					outcome: 'allowed',
					documentDate: utcDate.toISOString(),
					documentGuid: documentCreated.guid
				})
				.set('azureAdUserId', azureAdUserId);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenCalledWith({
				notifyClient: expect.any(Object),
				templateName: 'decision-is-allowed-split-dismissed-appellant',
				personalisation: {
					appeal_reference_number: '1345264',
					lpa_reference: '48269/APP/2021/1482',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					decision_date: formatDate(utcDate, false),
					front_office_url: 'https://appeal-planning-decision.service.gov.uk/appeals/1345264'
				},
				recipientEmail: 'test@136s7.com'
			});

			expect(mockNotifySend).toHaveBeenCalledWith({
				notifyClient: expect.any(Object),
				personalisation: {
					appeal_reference_number: '1345264',
					lpa_reference: '48269/APP/2021/1482',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					decision_date: formatDate(utcDate, false),
					front_office_url: 'https://appeal-planning-decision.service.gov.uk/appeals/1345264'
				},
				templateName: 'decision-is-allowed-split-dismissed-appellant',
				recipientEmail: 'test@136s7.com'
			});

			expect(response.status).toEqual(201);
		});
	});
});
