import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('final-comment-rejected-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'final-comment-rejected-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				deadline_date: '01 January 2021',
				reasons: ['Reason one', 'Reason two', 'Reason three']
			}
		};

		const expectedContent = [
			'We have rejected your final comments.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# Why we rejected your final comments',
			'',
			'We rejected your final comments because:',
			'',
			'- Reason one',
			'- Reason two',
			'- Reason three',
			'',
			'# What happens next',
			'',
			'You can send different final comments to caseofficers@planninginspectorate.gov.uk. The case officer will decide whether to accept any new final comments.',
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
				subject: 'We have rejected your final comments: ABC45678'
			}
		);
	});
});
