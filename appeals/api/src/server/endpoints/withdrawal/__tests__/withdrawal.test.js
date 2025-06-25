// @ts-nocheck
import { request } from '../../../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { fullPlanningAppeal, householdAppeal, listedBuildingAppeal } from '#tests/appeals/mocks.js';
import formatDate from '#utils/date-formatter.js';
import { add, sub } from 'date-fns';
import {
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_NOT_BE_IN_FUTURE
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
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

		test.each([
			['household', householdAppeal],
			['fullPlanning', fullPlanningAppeal],
			['listedBuilding', listedBuildingAppeal]
		])('returns 200 when appeal: %s is withdrawn', async (_, appeal) => {
			const correctAppealState = {
				...appeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.EVENT,
						valid: true
					}
				]
			};
			databaseConnector.appeal.findUnique.mockResolvedValue(correctAppealState);

			const tenDaysAgo = sub(new Date(), { days: 10 });
			const withoutWeekends = await recalculateDateIfNotBusinessDay(tenDaysAgo.toISOString());
			const utcDate = setTimeInTimeZone(withoutWeekends, 10, 0);

			const response = await request
				.post(`/appeals/${appeal.id}/withdrawal`)
				.send({
					withdrawalRequestDate: utcDate.toISOString()
				})
				.set('azureAdUserId', azureAdUserId);

			// eslint-disable-next-line no-undef
			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			// eslint-disable-next-line no-undef
			expect(mockNotifySend).toHaveBeenCalledWith({
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					withdrawal_date: formatDate(utcDate, false),
					event_set: true,
					event_type: 'site visit'
				},
				recipientEmail: 'test@136s7.com',
				templateName: 'appeal-withdrawn-appellant'
			});

			// eslint-disable-next-line no-undef
			expect(mockNotifySend).toHaveBeenCalledWith({
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					withdrawal_date: formatDate(utcDate, false),
					event_set: true,
					event_type: 'site visit'
				},
				recipientEmail: 'maid@lpa-email.gov.uk',
				templateName: 'appeal-withdrawn-lpa'
			});

			expect(response.status).toEqual(200);
		});
	});
});
