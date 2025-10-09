import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-type-change-in-manage-appeals-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-type-change-in-manage-appeals-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				lpa_reference: '48269/APP/2021/1482',
				existing_appeal_type: 'householder appeal',
				new_appeal_type: 'planning appeal',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# We have changed the appeal type',
			'',
			'The appeal did not match the type of application that the appellant made to the local planning authority.',
			'',
			'We have changed the householder appeal to planning appeal. We have removed any documents the appellant submitted that are not included with a planning appeal.',
			'',
			'# What happens next',
			'',
			'We will contact you when we start the appeal.',
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
				subject: 'We have changed an appeal: 134526'
			}
		);
	});
});
