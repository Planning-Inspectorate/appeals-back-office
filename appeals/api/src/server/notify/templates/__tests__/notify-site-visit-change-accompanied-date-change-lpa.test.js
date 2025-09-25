import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-accompanied-date-change-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-accompanied-date-change-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'lpa@example.com',
			personalisation: {
				appeal_reference_number: 'DEF67890',
				site_address: '44, Reschedule Road',
				lpa_reference: 'LPA-00987',
				visit_date: '5 September 2025',
				start_time: '3:15pm',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: DEF67890',
			'Address: 44, Reschedule Road',
			'Planning application reference: LPA-00987',
			'',
			'# The site visit has changed',
			'',
			'Our inspector (or their representative) will now visit 44, Reschedule Road at 3:15pm on 5 September 2025.',
			'',
			'# Who will attend',
			'',
			'You must be at the site at the scheduled time to accompany our inspector and the appellant.',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'lpa@example.com',
			{
				content: expectedContent,
				subject: 'Rescheduled inspector visit to appeal site: DEF67890'
			}
		);
	});
});
