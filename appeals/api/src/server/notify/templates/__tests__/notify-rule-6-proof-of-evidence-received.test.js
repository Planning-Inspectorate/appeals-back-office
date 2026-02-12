import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('rule-6-party-proof-of-evidence-received.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'rule-6-party-proof-of-evidence-received',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				inquiry_date: '15 March 2025',
				statement_url: '/mock-front-office-url/manage-appeals/ABC45678'
			}
		};

		const expectedContent = [
			'We have received proof of evidence and witnesses from a Rule 6 party.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You can [view the proof of evidence and witnesses in the appeals service](/mock-front-office-url/manage-appeals/ABC45678).',
			'',
			'The date of the inquiry is 15 March 2025.',
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
				subject: 'Rule 6 proof of evidence and witnesses: ABC45678'
			}
		);
	});
});
