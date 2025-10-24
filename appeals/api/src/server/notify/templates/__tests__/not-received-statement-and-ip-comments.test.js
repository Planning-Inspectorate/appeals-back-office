import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('not-received-statement-and-ip-comments.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'not-received-statement-and-ip-comments',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				what_happens_next:
					'You need to submit your proof of evidence and witnesses by 20th Oct 2025.'
			}
		};

		const expectedContent = [
			'We did not receive any statements or any comments from interested parties.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to submit your proof of evidence and witnesses by 20th Oct 2025.',
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
				subject:
					'We did not receive any statements or any comments from interested parties: ABC45678'
			}
		);
	});
});
