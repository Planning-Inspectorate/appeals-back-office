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
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { recalculateDateIfNotBusinessDay, setTimeInTimeZone } from '#utils/business-days.js';
import { notifySend } from '#notify/notify-send.js';

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
			expect(mockNotifySend).toHaveBeenCalledTimes(2);

			// eslint-disable-next-line no-undef
			expect(mockNotifySend).toHaveBeenCalledWith({
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: '1345264',
					lpa_reference: '48269/APP/2021/1482',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					withdrawal_date: formatDate(utcDate, false)
				},
				recipientEmail: 'test@136s7.com',
				templateName: 'appeal-withdrawn-appellant'
			});

			// eslint-disable-next-line no-undef
			expect(mockNotifySend).toHaveBeenCalledWith({
				notifyClient: expect.anything(),
				personalisation: {
					appeal_reference_number: '1345264',
					lpa_reference: '48269/APP/2021/1482',
					site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
					withdrawal_date: formatDate(utcDate, false)
				},
				recipientEmail: 'maid@lpa-email.gov.uk',
				templateName: 'appeal-withdrawn-lpa'
			});

			expect(response.status).toEqual(200);
		});
	});

	test('should call notify sendEmail for appeal-withdrawn-appellant with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-withdrawn-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				withdrawal_date: '01 January 2025'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# Appeal withdrawn',
			'',
			'We have withdrawn this appeal following your request on 01 January 2025.',
			'',
			'# Next steps',
			'',
			'Your case will be closed.',
			'',
			'Any appointments made for this appeal will be cancelled.',
			'',
			'The planning department that refused your application has been informed.',
			'',
			'# Feedback',
			'',
			'We welcome your feedback on our appeals process. Tell us on this short [feedback form](https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u).',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Appeal withdrawn: 134526'
			}
		);
	});

	test('should call notify sendEmail for appeal-withdrawn-lpa with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-withdrawn-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '234567',
				lpa_reference: '48269/APP/2021/1483',
				site_address: '98 The Avenue, Leftfield, Maidstone, Kent, MD21 5YY, United Kingdom',
				withdrawal_date: '03 January 2025'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '234567'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: 234567',
			'Address: 98 The Avenue, Leftfield, Maidstone, Kent, MD21 5YY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1483',
			'',
			'# Appeal withdrawn',
			'',
			'This appeal has been withdrawn following a request from the appellant dated 03 January 2025.',
			'',
			'# Next steps',
			'',
			'The case will be closed.',
			'',
			'Any appointments made for this appeal will be cancelled.',
			'',
			'The appellant has been informed.',
			'',
			'# Feedback',
			'',
			'We welcome your feedback on our appeals process. Tell us on this short [feedback form](https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u).',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Appeal withdrawn: 234567'
			}
		);
	});
});
