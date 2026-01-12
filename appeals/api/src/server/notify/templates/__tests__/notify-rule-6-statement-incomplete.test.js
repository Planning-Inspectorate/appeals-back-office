import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('rule-6-statement-incomplete.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'rule-6-statement-incomplete',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				reasons: 'You must provide a complete statement with all required documentation.',
				statement_deadline: '31 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We need more information with your statement.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What we need',
			'',
			'You must provide a complete statement with all required documentation.',
			'',
			'# What happens next',
			'',
			'You can send a different statement to caseofficers@planninginspectorate.gov.uk by 31 January 2025.',
			'',
			'The Planning Inspectorate'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'We need more information: ABC45678'
			}
		);
	});
});
