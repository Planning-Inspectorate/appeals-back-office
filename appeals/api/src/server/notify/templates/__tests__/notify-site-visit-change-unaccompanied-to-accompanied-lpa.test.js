import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-unaccompanied-to-accompanied-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-unaccompanied-to-accompanied-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'lpa@example.com',
			personalisation: {
				appeal_reference_number: 'ABC11223',
				site_address: '21, Appeal Avenue',
				lpa_reference: 'LPA-40404',
				visit_date: '6 October 2025',
				start_time: '2:30pm'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC11223',
			'Address: 21, Appeal Avenue',
			'Planning application reference: LPA-40404',
			'',
			'# Visit details',
			'',
			'Our inspector (or their representative) will visit 21, Appeal Avenue at 2:30pm on 6 October 2025.',
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
				subject: 'Inspector visit to appeal site: ABC11223'
			}
		);
	});
});
