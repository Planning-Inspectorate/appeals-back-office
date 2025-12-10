import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('inquiry-set-up.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'inquiry-set-up',
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
				inquiry_expected_days: '7',
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
			'Expected days: 7',
			'Venue address: 24, Court Street',
			'',
			'',
			'# What happens next',
			'',
			'You need to attend the inquiry on 31 January 2025.',
			'',
			'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
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
				subject: 'Inquiry details: ABC45678'
			}
		);
	});
});
