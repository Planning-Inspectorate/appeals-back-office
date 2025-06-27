import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('hearing-updated.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'hearing-updated',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				hearing_date: '31 January 2025',
				hearing_time: '1:30pm',
				hearing_address: '24, Court Street'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# About the hearing',
			'',
			'^Date: 31 January 2025',
			'Time: 1:30pm',
			'Venue address: 24, Court Street',
			'',
			'# What happens next',
			'',
			'You need to attend the hearing on 31 January 2025.',
			'',
			'The details of the hearing are subject to change. We will contact you by',
			'email if we make any changes.',
			'',
			'We expect the hearing to finish on the same day. If the hearing needs',
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
				subject: `We've updated your hearing details: ABC45678`
			}
		);
	});
});
