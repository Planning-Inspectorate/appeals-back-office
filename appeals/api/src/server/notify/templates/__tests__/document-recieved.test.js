import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('document-received.md', () => {
	test('should call notify sendEmail with the correct data when without responses invited.', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'document-received',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@example.com',
			personalisation: {
				appeal_reference_number: '134526',
				first_name: 'John',
				last_name: 'Doe',
				document_name: 'example.pdf',
				document_type: 'supporting-document',
				front_office_url: '/mock-front-office-url',
				contact_email: 'appeals@planninginspectorate.gov.uk',
				responses_invited: false,
				dashboard_link: 'appeals'
			}
		};

		const expectedContent = [
			'We have received the document example.pdf for appeal 134526.',
			'',
			'# What happens next',
			'',
			'You can [view the document in the appeals service](/mock-front-office-url/appeals/134526/supporting-document).',
			'',
			'',
			'',
			'The Planning Inspectorate',
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
				subject: 'We have received a new document for appeal 134526'
			}
		);
	});
	test('should call notify sendEmail with the correct data when with responses invited.', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'document-received',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@example.com',
			personalisation: {
				appeal_reference_number: '134526',
				first_name: 'John',
				last_name: 'Doe',
				document_name: 'example.pdf',
				document_type: 'supporting-document',
				front_office_url: '/mock-front-office-url',
				contact_email: 'appeals@planninginspectorate.gov.uk',
				responses_invited: true,
				deadline: '24 June 2026',
				dashboard_link: 'appeals'
			}
		};

		const expectedContent = [
			'We have received the document example.pdf for appeal 134526.',
			'',
			'# What happens next',
			'',
			'You can [view the document in the appeals service](/mock-front-office-url/appeals/134526/supporting-document).',
			'',
			'',
			'',
			'If you want to respond to example.pdf, send an email to appeals@planninginspectorate.gov.uk by 24 June 2026.',
			'',
			'',
			'',
			'The Planning Inspectorate',
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
				subject: 'We have received a new document for appeal 134526'
			}
		);
	});
});
