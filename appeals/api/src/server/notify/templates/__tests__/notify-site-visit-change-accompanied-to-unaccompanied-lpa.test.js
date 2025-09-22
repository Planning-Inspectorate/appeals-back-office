import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-accompanied-to-unaccompanied-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-accompanied-to-unaccompanied-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'lpa@example.com',
			personalisation: {
				appeal_reference_number: 'QRS33445',
				site_address: '99, Final Close',
				lpa_reference: 'CASE-89012',
				visit_date: '22 September 2025',
				start_time: '1:45pm',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: QRS33445',
			'Address: 99, Final Close',
			'Planning application reference: CASE-89012',
			'',
			'# The site visit has changed',
			'',
			'You are no longer required to accompany our inspector on the site visit to 99, Final Close at 1:45pm on 22 September 2025.',
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
				subject: 'Change of inspector visit to appeal site: QRS33445'
			}
		);
	});
});
