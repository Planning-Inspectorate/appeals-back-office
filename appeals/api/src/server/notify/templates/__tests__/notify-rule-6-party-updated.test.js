import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('rule-6-party-updated.md', () => {
	test('should call notify sendEmail with the correct data with org', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'rule-6-party-updated',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				rule_6_organisation: 'Rule 6 Org',
				team_email_address: 'team@example.com'
			}
		};

		const expectedContent = [
			'# Contact details',
			'',
			'^Organisation name: Rule 6 Org',
			'',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
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
				subject: 'We have updated the contact details for a Rule 6 group'
			}
		);
	});

	test('should call notify sendEmail with the correct data without org', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'rule-6-party-updated',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				team_email_address: 'team@example.com'
			}
		};

		const expectedContent = [
			'# Contact details',
			'',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
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
				subject: 'We have updated the contact details for a Rule 6 group'
			}
		);
	});
});
