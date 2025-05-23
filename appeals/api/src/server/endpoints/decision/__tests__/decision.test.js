// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { documentCreated } from '#tests/documents/mocks.js';
import formatDate from '#utils/date-formatter.js';
import { add, sub } from 'date-fns';
import {
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_NOT_BE_IN_FUTURE,
	ERROR_CASE_OUTCOME_MUST_BE_ONE_OF,
	ERROR_INVALID_APPEAL_STATE,
	AUDIT_TRAIL_DECISION_ISSUED,
	AUDIT_TRAIL_APPELLANT_COSTS_DECISION_ISSUED,
	AUDIT_TRAIL_LPA_COSTS_DECISION_ISSUED,
	AUDIT_TRAIL_PROGRESSED_TO_STATUS,
	DECISION_TYPE_INSPECTOR,
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_LPA_COSTS
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { recalculateDateIfNotBusinessDay, setTimeInTimeZone } from '#utils/business-days.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('decision routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		databaseConnector.user.upsert.mockResolvedValue({
			id: 1,
			azureAdUserId
		});
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
				.post(`/appeals/${householdAppeal.id}/decision`)
				.send({
					decisions: [
						{
							decisionType: DECISION_TYPE_INSPECTOR,
							outcome: 'unexpected',
							documentDate: '2023-11-10',
							documentGuid: documentCreated.guid
						}
					]
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'decisions[0].outcome': ERROR_CASE_OUTCOME_MUST_BE_ONE_OF
				}
			});
		});
		test('returns 400 when outcome is invalid', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/decision`)
				.send({
					decisions: [
						{
							decisionType: DECISION_TYPE_INSPECTOR,
							outcome: 'invalid',
							documentDate: '2023-11-10',
							documentGuid: documentCreated.guid
						}
					]
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'decisions[0].outcome': ERROR_CASE_OUTCOME_MUST_BE_ONE_OF
				}
			});
		});
		test('returns 400 when date is incorrect', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/decision`)
				.send({
					decisions: [
						{
							decisionType: DECISION_TYPE_INSPECTOR,
							outcome: 'allowed',
							documentDate: '2023-13-10',
							documentGuid: documentCreated.guid
						}
					]
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'decisions[0].documentDate': ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
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
				.post(`/appeals/${householdAppeal.id}/decision`)
				.send({
					decisions: [
						{
							decisionType: DECISION_TYPE_INSPECTOR,
							outcome: 'allowed',
							documentDate: utcDate.toISOString(),
							documentGuid: documentCreated.guid
						}
					]
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					'decisions[0].documentDate': ERROR_MUST_NOT_BE_IN_FUTURE
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
				.post(`/appeals/${householdAppeal.id}/decision`)
				.send({
					decisions: [
						{
							decisionType: DECISION_TYPE_INSPECTOR,
							outcome: 'allowed',
							documentDate: utcDate.toISOString(),
							documentGuid: documentCreated.guid
						}
					]
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
			const outcome = 'allowed';

			const response = await request
				.post(`/appeals/${householdAppeal.id}/decision`)
				.send({
					decisions: [
						{
							decisionType: DECISION_TYPE_INSPECTOR,
							outcome,
							documentDate: utcDate.toISOString(),
							documentGuid: documentCreated.guid
						},
						{
							decisionType: DECISION_TYPE_APPELLANT_COSTS,
							documentDate: utcDate.toISOString(),
							documentGuid: documentCreated.guid
						},
						{
							decisionType: DECISION_TYPE_LPA_COSTS,
							documentDate: utcDate.toISOString(),
							documentGuid: documentCreated.guid
						}
					]
				})
				.set('azureAdUserId', azureAdUserId);

			// eslint-disable-next-line no-undef
			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			// eslint-disable-next-line no-undef
			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				notifyClient: expect.any(Object),
				templateName: 'decision-is-allowed-split-dismissed-appellant',
				personalisation: {
					appeal_reference_number: '1345264',
					lpa_reference: '48269/APP/2021/1482',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					decision_date: formatDate(utcDate, false),
					front_office_url: 'https://appeal-planning-decision.service.gov.uk/appeals/1345264'
				},
				recipientEmail: householdAppeal.agent.email
			});

			// eslint-disable-next-line no-undef
			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				notifyClient: expect.any(Object),
				personalisation: {
					appeal_reference_number: '1345264',
					lpa_reference: '48269/APP/2021/1482',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					decision_date: formatDate(utcDate, false),
					front_office_url: 'https://appeal-planning-decision.service.gov.uk/appeals/1345264'
				},
				templateName: 'decision-is-allowed-split-dismissed-lpa',
				recipientEmail: householdAppeal.lpa.email
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(4);

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
				data: {
					appealId: householdAppeal.id,
					details: AUDIT_TRAIL_APPELLANT_COSTS_DECISION_ISSUED,
					loggedAt: expect.any(Date),
					userId: householdAppeal.caseOfficer.id
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
				data: {
					appealId: householdAppeal.id,
					details: AUDIT_TRAIL_LPA_COSTS_DECISION_ISSUED,
					loggedAt: expect.any(Date),
					userId: householdAppeal.caseOfficer.id
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(3, {
				data: {
					appealId: householdAppeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_DECISION_ISSUED, [outcome]),
					loggedAt: expect.any(Date),
					userId: householdAppeal.caseOfficer.id
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(4, {
				data: {
					appealId: householdAppeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, ['complete']),
					loggedAt: expect.any(Date),
					userId: householdAppeal.caseOfficer.id
				}
			});

			expect(response.status).toEqual(201);
		});
	});
});
