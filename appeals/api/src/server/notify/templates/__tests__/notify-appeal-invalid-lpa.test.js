import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-invalid-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-invalid-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'appealplanningdecisiontest@planninginspectorate.gov.uk',
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
			'# The appeal is not valid',
			'',
			'We have reviewed the appeal and it is not valid.',
			'',
			'The appeal is now closed.',
			'',
			'# Why the appeal is not valid',
			'',
			'- Appeal has not been submitted on time',
			'- Other: The appeal site address does not match',
			'',
			'# Feedback',
			'',
			'This is a new service. Help us improve it and [give your feedback](http://link%20to%20feedback%20form/).',
			'',
			'The Planning Inspectorate',
			'',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'appealplanningdecisiontest@planninginspectorate.gov.uk',
			{
				content: expectedContent,
				subject: 'Appeal invalid: 134526'
			}
		);
	});
});
