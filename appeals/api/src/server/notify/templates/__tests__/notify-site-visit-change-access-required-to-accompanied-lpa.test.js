import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-access-required-to-accompanied-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-access-required-to-accompanied-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'planning.officer@example.com',
			personalisation: {
				appeal_reference_number: 'LMN34567',
				site_address: '77, Decision Way',
				lpa_reference: 'PLA-98765',
				visit_date: '25 July 2025',
				start_time: '11:15am'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: LMN34567',
			'Address: 77, Decision Way',
			'Planning application reference: PLA-98765',
			'',
			'# Visit details',
			'',
			'Our inspector (or their representative) will visit 77, Decision Way at 11:15am on 25 July 2025.',
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
			'planning.officer@example.com',
			{
				content: expectedContent,
				subject: 'Inspector visit to appeal site: LMN34567'
			}
		);
	});
});
