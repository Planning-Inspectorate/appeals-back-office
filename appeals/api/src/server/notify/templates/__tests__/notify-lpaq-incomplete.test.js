import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('lpaq-incomplete.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'lpaq-incomplete',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				due_date: '22 June 2099',
				reasons: [
					'Documents or information are missing: Policy is missing',
					'Other: Addresses are incorrect or missing'
				]
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# Your questionnaire is incomplete',
			'',
			'We need more information before we can review your questionnaire about this appeal.',
			'',
			'# What we need',
			'',
			'Send the following to caseofficers@planninginspectorate.gov.uk by 22 June 2099:',
			'',
			'- Documents or information are missing: Policy is missing',
			'- Other: Addresses are incorrect or missing',
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
				subject: 'Complete your appeal questionnaire: ABC45678'
			}
		);
	});
});
