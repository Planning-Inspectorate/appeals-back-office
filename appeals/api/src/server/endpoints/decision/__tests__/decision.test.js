// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import {
	householdAppeal,
	casPlanningAppeal,
	fullPlanningAppeal,
	listedBuildingAppeal
} from '#tests/appeals/mocks.js';
import { documentCreated } from '#tests/documents/mocks.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
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
	DECISION_TYPE_LPA_COSTS,
	CASE_RELATIONSHIP_LINKED
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import {
	recalculateDateIfNotBusinessDay,
	setTimeInTimeZone
} from '@pins/appeals/utils/business-days.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { AUDIT_TRAIL_CORRECTION_NOTICE_ADDED } from '@pins/appeals/constants/support.js';
import { sendNewDecisionLetter } from '../decision.service';
import { cloneDeep } from 'lodash-es';
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

		test.each([
			['householdAppeal', householdAppeal],
			['casPlanningAppeal', casPlanningAppeal],
			['fullPlanningAppeal', fullPlanningAppeal],
			['listedBuildingAppeal', listedBuildingAppeal]
		])('returns 200 when all good, appeal type: %s', async (_, appeal) => {
			const correctAppealState = {
				...appeal,
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
				.post(`/appeals/${appeal.id}/decision`)
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

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.any(Object),
				personalisation: {
					appeal_reference_number: appeal.reference,
					child_appeals: [],
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					decision_date: formatDate(utcDate, false),
					front_office_url: `https://appeal-planning-decision.service.gov.uk/appeals/${appeal.reference}`
				},
				templateName: 'decision-is-allowed-split-dismissed-appellant',
				recipientEmail: appeal.agent.email
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.any(Object),
				personalisation: {
					appeal_reference_number: appeal.reference,
					child_appeals: [],
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					decision_date: formatDate(utcDate, false),
					front_office_url: `https://appeal-planning-decision.service.gov.uk/appeals/${appeal.reference}`
				},
				templateName: 'decision-is-allowed-split-dismissed-lpa',
				recipientEmail: appeal.lpa.email
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(4);

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
				data: {
					appealId: appeal.id,
					details: AUDIT_TRAIL_APPELLANT_COSTS_DECISION_ISSUED,
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
				data: {
					appealId: appeal.id,
					details: AUDIT_TRAIL_LPA_COSTS_DECISION_ISSUED,
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(3, {
				data: {
					appealId: appeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_DECISION_ISSUED, [
						outcome[0].toUpperCase() + outcome.slice(1)
					]),
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(4, {
				data: {
					appealId: appeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, ['complete']),
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});

			expect(response.status).toEqual(201);
		});

		test('returns 200 when only issuing appellant costs decisions', async () => {
			const appeal = cloneDeep(householdAppeal);
			const correctAppealState = {
				...appeal,
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
				.post(`/appeals/${appeal.id}/decision`)
				.send({
					decisions: [
						{
							decisionType: DECISION_TYPE_APPELLANT_COSTS,
							documentDate: utcDate.toISOString(),
							documentGuid: documentCreated.guid
						}
					]
				})
				.set('azureAdUserId', azureAdUserId);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.any(Object),
				templateName: 'appellant-costs-decision-appellant',
				personalisation: {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					front_office_url: `https://appeal-planning-decision.service.gov.uk/appeals/${appeal.reference}`
				},
				recipientEmail: appeal.agent.email
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.any(Object),
				personalisation: {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					front_office_url: `https://appeal-planning-decision.service.gov.uk/appeals/${appeal.reference}`
				},
				templateName: 'appellant-costs-decision-lpa',
				recipientEmail: appeal.lpa.email
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
				data: {
					appealId: appeal.id,
					details: AUDIT_TRAIL_APPELLANT_COSTS_DECISION_ISSUED,
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});

			expect(response.status).toEqual(201);
		});

		test('returns 200 when only issuing lpa costs decisions', async () => {
			const appeal = cloneDeep(householdAppeal);
			const correctAppealState = {
				...appeal,
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
				.post(`/appeals/${appeal.id}/decision`)
				.send({
					decisions: [
						{
							decisionType: DECISION_TYPE_LPA_COSTS,
							documentDate: utcDate.toISOString(),
							documentGuid: documentCreated.guid
						}
					]
				})
				.set('azureAdUserId', azureAdUserId);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.any(Object),
				templateName: 'lpa-costs-decision-appellant',
				personalisation: {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					front_office_url: `https://appeal-planning-decision.service.gov.uk/appeals/${appeal.reference}`
				},
				recipientEmail: appeal.agent.email
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.any(Object),
				personalisation: {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					front_office_url: `https://appeal-planning-decision.service.gov.uk/appeals/${appeal.reference}`
				},
				templateName: 'lpa-costs-decision-lpa',
				recipientEmail: appeal.lpa.email
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
				data: {
					appealId: appeal.id,
					details: AUDIT_TRAIL_LPA_COSTS_DECISION_ISSUED,
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});

			expect(response.status).toEqual(201);
		});

		test('returns 200 when all good for linked appeals', async () => {
			const tenDaysAgo = sub(new Date(), { days: 10 });
			const withoutWeekends = await recalculateDateIfNotBusinessDay(tenDaysAgo.toISOString());
			const utcDate = setTimeInTimeZone(withoutWeekends, 0, 0);
			const outcome = 'allowed';
			const childAppeal = {
				appealId: 4,
				childRef: 'CHILD123',
				inspectorDecision: outcome,
				type: CASE_RELATIONSHIP_LINKED
			};
			const appeal = {
				...fullPlanningAppeal,
				isChildAppeal: true,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
						valid: true
					}
				],
				childAppeals: [childAppeal]
			};

			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(appeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);
			// @ts-ignore
			databaseConnector.inspectorDecision.create.mockResolvedValue({});

			const response = await request
				.post(`/appeals/${appeal.id}/decision`)
				.send({
					decisions: [
						{
							decisionType: DECISION_TYPE_INSPECTOR,
							outcome,
							documentDate: utcDate.toISOString(),
							documentGuid: documentCreated.guid
						},
						{
							appealId: childAppeal.appealId,
							decisionType: DECISION_TYPE_INSPECTOR,
							outcome,
							documentDate: utcDate.toISOString(),
							documentGuid: documentCreated.guid,
							isChildAppeal: true
						}
					]
				})
				.set('azureAdUserId', azureAdUserId);

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenNthCalledWith(1, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.any(Object),
				personalisation: {
					appeal_reference_number: appeal.reference,
					child_appeals: [childAppeal.childRef],
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					decision_date: formatDate(utcDate, false),
					front_office_url: `https://appeal-planning-decision.service.gov.uk/appeals/${appeal.reference}`
				},
				templateName: 'decision-is-allowed-split-dismissed-appellant',
				recipientEmail: appeal.agent.email
			});

			expect(mockNotifySend).toHaveBeenNthCalledWith(2, {
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.any(Object),
				personalisation: {
					appeal_reference_number: appeal.reference,
					child_appeals: [childAppeal.childRef],
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					decision_date: formatDate(utcDate, false),
					front_office_url: `https://appeal-planning-decision.service.gov.uk/appeals/${appeal.reference}`
				},
				templateName: 'decision-is-allowed-split-dismissed-lpa',
				recipientEmail: appeal.lpa.email
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(4);

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
				data: {
					appealId: childAppeal.appealId,
					details: stringTokenReplacement(AUDIT_TRAIL_DECISION_ISSUED, [
						outcome[0].toUpperCase() + outcome.slice(1)
					]),
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
				data: {
					appealId: childAppeal.appealId,
					details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, ['complete']),
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(3, {
				data: {
					appealId: appeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_DECISION_ISSUED, [
						outcome[0].toUpperCase() + outcome.slice(1)
					]),
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(4, {
				data: {
					appealId: appeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, ['complete']),
					loggedAt: expect.any(Date),
					userId: appeal.caseOfficer.id
				}
			});

			expect(response.status).toEqual(201);
		});
	});

	describe('sendNewDecisionLetter', () => {
		let mockNotifyClient;

		beforeEach(() => {
			mockNotifyClient = {
				mockNotifySend: jest.fn().mockResolvedValue({})
			};
		});

		afterEach(() => {
			mockNotifyClient = null;
		});

		test('sends correction notice to all unique emails and creates audit trail', async () => {
			const correctAppealState = {
				...householdAppeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
						valid: true
					}
				]
			};

			databaseConnector.representation.count.mockResolvedValue(2);
			databaseConnector.appeal.findUnique.mockResolvedValue(correctAppealState);
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);
			databaseConnector.representation.findMany.mockResolvedValue([
				{
					represented: {
						email: 'commenter1@test.com'
					}
				},
				{
					represented: {
						email: 'commenter2@test.com'
					}
				}
			]);

			const correctionNotice = 'Test correction notice';
			const decisionDate = new Date('2023-11-10');

			await sendNewDecisionLetter(
				correctAppealState,
				correctionNotice,
				azureAdUserId,
				mockNotifyClient,
				decisionDate
			);

			expect(mockNotifySend).toHaveBeenCalledTimes(5);

			const expectedRecipients = [
				{ type: 'agent', email: correctAppealState.agent.email },
				{ type: 'appellant', email: correctAppealState.appellant.email },
				{ type: 'lpa', email: correctAppealState.lpa.email },
				{ type: 'commenter', email: 'commenter2@test.com' },
				{ type: 'commenter', email: 'commenter1@test.com' }
			];

			expectedRecipients.forEach((recipient) => {
				expect(mockNotifySend).toHaveBeenCalledWith({
					azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
					notifyClient: expect.any(Object),
					templateName: 'correction-notice-decision',
					recipientEmail: recipient.email,
					personalisation: {
						appeal_reference_number: correctAppealState.reference,
						lpa_reference: correctAppealState.applicationReference,
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						front_office_url: 'https://appeal-planning-decision.service.gov.uk/appeals/1345264',
						correction_notice_reason: correctionNotice,
						decision_date: formatDate(decisionDate, false)
					}
				});
			});

			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: correctAppealState.id,
					details: stringTokenReplacement(AUDIT_TRAIL_CORRECTION_NOTICE_ADDED, [correctionNotice]),
					loggedAt: expect.any(Date),
					userId: correctAppealState.caseOfficer.id
				}
			});
		});

		test('handles missing emails correctly', async () => {
			const appealWithMissingEmails = {
				...householdAppeal,
				agent: null,
				appellant: null,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
						valid: true
					}
				]
			};

			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithMissingEmails);
			databaseConnector.representation.count.mockResolvedValue(0);
			databaseConnector.representation.findMany.mockResolvedValue([]);

			const correctionNotice = 'Test correction notice';
			const decisionDate = new Date('2023-11-10');

			await sendNewDecisionLetter(
				appealWithMissingEmails,
				correctionNotice,
				azureAdUserId,
				mockNotifyClient,
				decisionDate
			);

			expect(mockNotifySend).toHaveBeenCalledTimes(1);

			expect(mockNotifySend).toHaveBeenCalledWith({
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.any(Object),
				templateName: 'correction-notice-decision',
				recipientEmail: appealWithMissingEmails.lpa.email,
				personalisation: {
					appeal_reference_number: appealWithMissingEmails.reference,
					lpa_reference: appealWithMissingEmails.applicationReference,
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					front_office_url: 'https://appeal-planning-decision.service.gov.uk/appeals/1345264',
					correction_notice_reason: correctionNotice,
					decision_date: formatDate(decisionDate, false)
				}
			});
		});
	});
});
