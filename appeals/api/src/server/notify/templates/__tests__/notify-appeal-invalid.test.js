import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-invalid.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-invalid',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				reasons: [
					'Appeal has not been submitted on time',
					'Other: The appeal site address does not match'
				]
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# Your appeal is not valid',
			'',
			'We have reviewed your appeal and it is not valid.',
			'',
			'## Why your appeal is not valid',
			'',
			'- Appeal has not been submitted on time',
			'- Other: The appeal site address does not match',
			'',
			'# Next steps',
			'',
			'Your case will be closed. We have told the local planning authority.',
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
				subject: 'Your appeal is not valid: 134526'
			}
		);
	});
});
