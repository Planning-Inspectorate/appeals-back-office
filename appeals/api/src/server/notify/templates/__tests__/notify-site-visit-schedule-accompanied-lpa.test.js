import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-schedule-accompanied-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-schedule-accompanied-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'lpa@example.com',
			personalisation: {
				appeal_reference_number: 'BBB22334',
				site_address: '72, Planning Crescent',
				lpa_reference: 'REF-56789',
				visit_date: '20 October 2025',
				start_time: '2:00pm'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: BBB22334',
			'Address: 72, Planning Crescent',
			'Planning application reference: REF-56789',
			'',
			'# Visit details',
			'',
			'Our inspector (or their representative) will visit 72, Planning Crescent at 2:00pm on 20 October 2025.',
			'',
			'# Who will attend',
			'',
			'You must be at the site at the scheduled time to accompany our inspector and the appellant .',
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
				subject: 'Inspector visit to appeal site: BBB22334'
			}
		);
	});
});
