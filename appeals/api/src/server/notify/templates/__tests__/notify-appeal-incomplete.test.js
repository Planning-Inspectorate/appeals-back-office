import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-incomplete.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-incomplete',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				due_date: '14 July 2099',
				reasons: [
					'The original application form is incomplete',
					'Other: Appellant contact information is incorrect or missing'
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
			'We have received your appeal and we need more information.',
			'',
			'# Next steps',
			'',
			'You need to submit the following by 14 July 2099 to caseofficers@planninginspectorate.gov.uk',
			'',
			'- The original application form is incomplete',
			'- Other: Appellant contact information is incorrect or missing',
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
				subject: 'We need more information: 134526'
			}
		);
	});
});
