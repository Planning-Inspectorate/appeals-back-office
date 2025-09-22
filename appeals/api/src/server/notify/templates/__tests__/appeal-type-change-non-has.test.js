import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-type-change-non-has.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-type-change-non-has',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				start_date: '01 January 2025',
				local_planning_authority: 'Bristol City Council',
				existing_appeal_type: 'Householder',
				appeal_type: 'D',
				due_date: '01 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# Submit a different appeal',
			'',
			'Your appeal does not match the type of application that you made to the local planning authority. We have cancelled your Householder.',
			'',
			'# Next steps',
			'',
			'You need to submit a new D by 01 January 2025 at /mock-front-office-url/before-you-start.',
			'',
			'We have closed your Householder.',
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
				subject: 'You need to submit a different appeal: 134526'
			}
		);
	});
});
