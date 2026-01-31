import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('rule-6-status-accepted-main-parties.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'rule-6-status-accepted-main-parties',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				rule_6_organisation: 'Rule 6 Org',
				contact_email: 'test-contact@example.com',
				team_email_address: 'team@example.com'
			}
		};

		const expectedContent = [
			'^Organisation name: Rule 6 Org',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# About Rule 6 status',
			'',
			'Anyone with Rule 6 status is considered a main party. They can view information submitted by:',
			'',
			'* the appellant',
			'* local planning authority',
			'* any other Rule 6 parties',
			'',
			'Rule 6 parties can:',
			'',
			'* submit a statement',
			'* submit proof of evidence and witnesses',
			'* appear at the inquiry to cross-examine other parties',
			'',
			'If you have any questions, contact',
			'team@example.com',
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
				subject: 'We have accepted a new application for Rule 6 status'
			}
		);
	});
});
