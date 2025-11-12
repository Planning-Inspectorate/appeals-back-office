import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('inquiry-updated.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'inquiry-updated',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				inquiry_date: '31 January 2025',
				inquiry_time: '1:30pm',
				inquiry_expected_days: '6',
				inquiry_address: '24, Court Street',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# About the inquiry',
			'',
			'^Date: 31 January 2025',
			'Time: 1:30pm',
			'Expected days: 6',
			'Venue address: 24, Court Street',
			'',
			'',
			'# What happens next',
			'',
			'You need to attend the inquiry on 31 January 2025.',
			'',
			'The details of the inquiry are subject to change. We will contact you by',
			'email if we make any changes.',
			'',
			'We expect the inquiry to finish on the same day. If the inquiry needs',
			'more time, you will arrange the next steps on the day.',
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
				subject: `We've updated your inquiry details: ABC45678`
			}
		);
	});

	test('should call notify sendEmail with the correct data when expected_days and address is not provided', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'inquiry-updated',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				inquiry_date: '31 January 2025',
				inquiry_time: '1:30pm',
				inquiry_expected_days: '',
				inquiry_address: '',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# About the inquiry',
			'',
			'^Date: 31 January 2025',
			'Time: 1:30pm',
			'',
			'',
			'# What happens next',
			'',
			'You need to attend the inquiry on 31 January 2025.',
			'',
			'The details of the inquiry are subject to change. We will contact you by',
			'email if we make any changes.',
			'',
			'We expect the inquiry to finish on the same day. If the inquiry needs',
			'more time, you will arrange the next steps on the day.',
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
				subject: `We've updated your inquiry details: ABC45678`
			}
		);
	});
});
