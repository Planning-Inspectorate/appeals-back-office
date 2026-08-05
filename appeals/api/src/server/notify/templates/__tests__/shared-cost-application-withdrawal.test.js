import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('shared-cost-application-withdrawal.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'shared-cost-application-withdrawal',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@example.com',
			personalisation: {
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				lpa_reference: '48269/APP/2021/1482',
				contact_email: 'appeals@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'The application for costs against appeal 134526 has been withdrawn.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'Planning Inspectorate ',
			'',
			'appeals@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@example.com',
			{
				content: expectedContent,
				subject: 'The application for costs against appeal 134526 has been withdrawn'
			}
		);
	});
});
