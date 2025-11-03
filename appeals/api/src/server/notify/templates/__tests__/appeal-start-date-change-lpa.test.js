import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-start-date-change-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-start-date-change-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_type: 'Planning',
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				start_date: '01 January 2025',
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'# New start date for appeal',
			'',
			'There is a new start date for the Planning appeal against the planning application 48269/APP/2021/1482.',
			'',
			'The new start date is 01 January 2025.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Next steps',
			'',
			'[Submit your questionnaire](/mock-front-office-url/manage-appeals/134526) by 01 January 2025.',
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
				subject: 'New start date: 134526'
			}
		);
	});
});
