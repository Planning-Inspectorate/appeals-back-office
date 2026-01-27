// @ts-nocheck
import {
	advertisementAppeal,
	casAdvertAppeal,
	casPlanningAppeal,
	fullPlanningAppeal,
	householdAppeal,
	listedBuildingAppeal
} from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import { FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import {
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_NOT_BE_IN_FUTURE
} from '@pins/appeals/constants/support.js';
import {
	recalculateDateIfNotBusinessDay,
	setTimeInTimeZone
} from '@pins/appeals/utils/business-days.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { add, sub } from 'date-fns';
import { request } from '../../../app-test.js';
const { databaseConnector } = await import('#utils/database-connector.js');

describe('appeal withdrawal routes', () => {
	beforeAll(() => {
		jest.clearAllMocks();
	});
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
			['household', householdAppeal, FEEDBACK_FORM_LINKS.HAS],
			['casPlanning', casPlanningAppeal, FEEDBACK_FORM_LINKS.CAS_PLANNING],
			['casAdvert', casAdvertAppeal, FEEDBACK_FORM_LINKS.CAS_ADVERTS],
			['advertisement', advertisementAppeal, FEEDBACK_FORM_LINKS.FULL_ADVERTS],
			['fullPlanning', fullPlanningAppeal, FEEDBACK_FORM_LINKS.S78],
			['listedBuilding', listedBuildingAppeal, FEEDBACK_FORM_LINKS.S20]
		])('returns 200 when appeal: %s is withdrawn', async (_, appeal, expectedFeedbackLink) => {
			const correctAppealState = {
				...appeal,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.EVENT,
						valid: true
					}
				],
				hearing: null
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

			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			expect(mockNotifySend).toHaveBeenCalledWith({
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					feedback_link: expectedFeedbackLink,
					withdrawal_date: formatDate(utcDate, false),
					event_set: true,
					event_type: 'site visit',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: 'test@136s7.com',
				templateName: 'appeal-withdrawn-appellant'
			});

			expect(mockNotifySend).toHaveBeenCalledWith({
				azureAdUserId: '6f930ec9-7f6f-448c-bb50-b3b898035959',
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference,
					site_address: `${appeal.address.addressLine1}, ${appeal.address.addressLine2}, ${appeal.address.addressTown}, ${appeal.address.addressCounty}, ${appeal.address.postcode}, ${appeal.address.addressCountry}`,
					feedback_link: FEEDBACK_FORM_LINKS.LPA,
					withdrawal_date: formatDate(utcDate, false),
					event_set: true,
					event_type: 'site visit',
					team_email_address: 'caseofficers@planninginspectorate.gov.uk'
				},
				recipientEmail: 'maid@lpa-email.gov.uk',
				templateName: 'appeal-withdrawn-lpa'
			});

			expect(response.status).toEqual(200);
		});

		test('notifies Rule 6 party when appeal is withdrawn', async () => {
			const rule6Party = {
				id: 1,
				serviceUser: {
					email: 'rule6@example.com'
				}
			};
			const correctAppealState = {
				...householdAppeal,
				appealRule6Parties: [rule6Party],
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.EVENT,
						valid: true
					}
				],
				hearing: null
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

			expect(mockNotifySend).toHaveBeenCalledTimes(3);

			// Verify Rule 6 notification
			expect(mockNotifySend).toHaveBeenCalledWith(
				expect.objectContaining({
					recipientEmail: 'rule6@example.com',
					templateName: 'appeal-withdrawn-lpa', // Generic/LPA template
					personalisation: expect.objectContaining({
						feedback_link: FEEDBACK_FORM_LINKS.LPA
					})
				})
			);

			expect(response.status).toEqual(200);
		});
	});
});
