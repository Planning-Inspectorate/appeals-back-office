// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { documentCreated } from '#tests/documents/mocks.js';
import formatDate from '#utils/date-formatter.js';
import { add, sub } from 'date-fns';
import {
	ERROR_MUST_BE_CORRECT_DATE_FORMAT,
	ERROR_MUST_BE_IN_PAST,
	ERROR_CASE_OUTCOME_MUST_BE_ONE_OF,
	ERROR_INVALID_APPEAL_STATE,
	FRONT_OFFICE_URL
} from '#endpoints/constants.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

const { databaseConnector } = await import('#utils/database-connector.js');
import config from '#config/config.js';

describe('appeal decision routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
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
					documentDate: ERROR_MUST_BE_CORRECT_DATE_FORMAT
				}
			});
		});
		test('returns 400 when date is in the future', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const today = add(new Date(), { days: 1 });
			const year = today.toLocaleString('default', { year: 'numeric' });
			const month = today.toLocaleString('default', { month: '2-digit' });
			const day = today.toLocaleString('default', { day: '2-digit' });

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision`)
				.send({
					outcome: 'allowed',
					documentDate: [year, month, day].join('-'),
					documentGuid: documentCreated.guid
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					documentDate: ERROR_MUST_BE_IN_PAST
				}
			});
		});
		test('returns 400 when state is not correct', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.document.findUnique.mockResolvedValue(documentCreated);

			const today = sub(new Date(), { days: 10 });
			const year = today.toLocaleString('default', { year: 'numeric' });
			const month = today.toLocaleString('default', { month: '2-digit' });
			const day = today.toLocaleString('default', { day: '2-digit' });

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision`)
				.send({
					outcome: 'allowed',
					documentDate: [year, month, day].join('-'),
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

			const today = sub(new Date(), { days: 10 });
			const year = today.toLocaleString('default', { year: 'numeric' });
			const month = today.toLocaleString('default', { month: '2-digit' });
			const day = today.toLocaleString('default', { day: '2-digit' });

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inspector-decision`)
				.send({
					outcome: 'allowed',
					documentDate: [year, month, day].join('-'),
					documentGuid: documentCreated.guid
				})
				.set('azureAdUserId', azureAdUserId);

			// eslint-disable-next-line no-undef
			expect(mockSendEmail).toHaveBeenCalledTimes(2);

			// eslint-disable-next-line no-undef
			expect(mockSendEmail).toHaveBeenCalledWith(
				config.govNotify.template.decisionIsAllowedSplitDismissed.appellant.id,
				'test@136s7.com',
				{
					emailReplyToId: null,
					personalisation: {
						appeal_reference_number: '1345264',
						lpa_reference: '48269/APP/2021/1482',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						url: FRONT_OFFICE_URL,
						decision_date: formatDate(new Date(today || ''), false)
					},
					reference: null
				}
			);

			// eslint-disable-next-line no-undef
			expect(mockSendEmail).toHaveBeenCalledWith(
				config.govNotify.template.decisionIsAllowedSplitDismissed.lpa.id,
				'maid@lpa-email.gov.uk',
				{
					emailReplyToId: null,
					personalisation: {
						appeal_reference_number: '1345264',
						lpa_reference: '48269/APP/2021/1482',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						url: FRONT_OFFICE_URL,
						decision_date: formatDate(new Date(today || ''), false)
					},
					reference: null
				}
			);

			expect(response.status).toEqual(200);
		});
	});
});
