import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('received-statement-and-ip-comments-lpa.md', () => {
	test('should call notify sendEmail with the correct data without what_happens_next', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'received-statement-and-ip-comments-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				final_comments_deadline: '01 January 2021',
				subject: 'Submit your final comments'
			}
		};

		const expectedContent = [
			'We’ve received comments from interested parties.',
			'',
			'You can [view this information in the appeals service](/mock-front-office-url/manage-appeals/ABC45678).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
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
				subject: 'Submit your final comments: ABC45678'
			}
		);
	});

	test('should call notify sendEmail with the correct data with what_happens_next', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'received-statement-and-ip-comments-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				final_comments_deadline: '01 January 2021',
				what_happens_next:
					'You need to [submit your final comments](/mock-front-office-url/manage-appeals/ABC45678) by 01 January 2021.',
				subject: 'Submit your final comments'
			}
		};

		const expectedContent = [
			'We’ve received comments from interested parties.',
			'',
			'You can [view this information in the appeals service](/mock-front-office-url/manage-appeals/ABC45678).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit your final comments](/mock-front-office-url/manage-appeals/ABC45678) by 01 January 2021.',
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
				subject: 'Submit your final comments: ABC45678'
			}
		);
	});
});
