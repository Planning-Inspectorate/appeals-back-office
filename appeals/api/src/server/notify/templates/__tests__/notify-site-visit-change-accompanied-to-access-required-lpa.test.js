import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-accompanied-to-access-required-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-accompanied-to-access-required-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'lpa@example.com',
			personalisation: {
				appeal_reference_number: 'JKL98765',
				site_address: '23, Transition Street',
				lpa_reference: 'CASE-45632',
				visit_date: '14 September 2025',
				start_time: '10:00am'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: JKL98765',
			'Address: 23, Transition Street',
			'Planning application reference: CASE-45632',
			'',
			'# The site visit has changed',
			'',
			'You are no longer required to accompany our inspector on the site visit to 23, Transition Street at 10:00am on 14 September 2025.',
			'',
			'Our inspector (or their representative) will now carry out the inspection on their own.',
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
				subject: 'Change of inspector visit to appeal site: JKL98765'
			}
		);
	});
});
