import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-unaccompanied-to-accompanied-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-unaccompanied-to-accompanied-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'appellant@example.com',
			personalisation: {
				appeal_reference_number: 'XYZ55667',
				site_address: '88, Inspector Rise',
				lpa_reference: 'LPA-30303',
				visit_date: '3 October 2025',
				start_time: '10:45am',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: XYZ55667',
			'Address: 88, Inspector Rise',
			'Planning application reference: LPA-30303',
			'',
			'# The site visit has changed',
			'',
			'You must now attend the site visit with our inspector (or their representative) and a representative from the local planning authority.',
			'',
			'You will accompany the inspector throughout the visit.',
			'',
			'# Visit details',
			'',
			'Our inspector will visit 88, Inspector Rise at 10:45am on 3 October 2025.',
			'',
			'If you need to contact us, include our appeal reference number in any communication.',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'appellant@example.com',
			{
				content: expectedContent,
				subject: 'Change to inspector visit to appeal site: XYZ55667'
			}
		);
	});
});
