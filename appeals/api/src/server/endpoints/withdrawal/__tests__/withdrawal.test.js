// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import formatDate from '#utils/date-formatter.js';
import { add, sub } from 'date-fns';
import {
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_NOT_BE_IN_FUTURE
} from '#endpoints/constants.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import config from '#config/config.js';
import { recalculateDateIfNotBusinessDay, setTimeInTimeZone } from '#utils/business-days.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('appeal withdrawal routes', () => {
	beforeEach(() => {
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST', () => {
		test('returns 400 when date is incorrect', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/withdrawal`)
				.send({
					withdrawalRequestDate: '2023-13-10'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					withdrawalRequestDate: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
				}
			});
		});
		test('returns 400 when date is in the future', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const tomorrow = add(new Date(), { days: 1 });
			const utcDate = setTimeInTimeZone(tomorrow, 10, 0);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/withdrawal`)
				.send({
					withdrawalRequestDate: utcDate.toISOString()
				})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					withdrawalRequestDate: ERROR_MUST_NOT_BE_IN_FUTURE
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
			databaseConnector.appeal.findUnique.mockResolvedValue(correctAppealState);

			const tenDaysAgo = sub(new Date(), { days: 10 });
			const withoutWeekends = await recalculateDateIfNotBusinessDay(tenDaysAgo.toISOString());
			const utcDate = setTimeInTimeZone(withoutWeekends, 10, 0);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/withdrawal`)
				.send({
					withdrawalRequestDate: utcDate.toISOString()
				})
				.set('azureAdUserId', azureAdUserId);

			// eslint-disable-next-line no-undef
			expect(mockSendEmail).toHaveBeenCalledTimes(2);

			// eslint-disable-next-line no-undef
			expect(mockSendEmail).toHaveBeenCalledWith(
				config.govNotify.template.appealWithdrawn.appellant.id,
				'test@136s7.com',
				{
					emailReplyToId: null,
					personalisation: {
						appeal_reference_number: '1345264',
						lpa_reference: '48269/APP/2021/1482',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						withdrawal_date: formatDate(utcDate, false)
					},
					reference: null
				}
			);

			// eslint-disable-next-line no-undef
			expect(mockSendEmail).toHaveBeenCalledWith(
				config.govNotify.template.appealWithdrawn.lpa.id,
				'maid@lpa-email.gov.uk',
				{
					emailReplyToId: null,
					personalisation: {
						appeal_reference_number: '1345264',
						lpa_reference: '48269/APP/2021/1482',
						site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
						withdrawal_date: formatDate(utcDate, false)
					},
					reference: null
				}
			);

			expect(response.status).toEqual(200);
		});
	});
});
