import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('rule-6-status-accepted-rule-6-party.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'rule-6-status-accepted-rule-6-party',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				statements_due_date: '10 March 2025',
				proofs_due_date: '20 March 2025',
				team_email_address: 'team@example.com'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You can go to https://appeal-a-planning-decision.service.gov.uk/ to:',
			'',
			'* view the appeal',
			'* submit a statement of case by 10 March 2025',
			'* submit proof of evidence and witnesses by 20 March 2025',
			'',
			'The Planning Inspectorate',
			'team@example.com'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'We have accepted your application for Rule 6 status'
			}
		);
	});
});
