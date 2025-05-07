import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-access-required-to-accompanied-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-access-required-to-accompanied-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@example.com',
			personalisation: {
				appeal_reference_number: 'XYZ67890',
				site_address: '55, Sample Road',
				lpa_reference: 'APP-45678',
				visit_date: '19 June 2025',
				start_time: '2:00pm'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: XYZ67890',
			'Address: 55, Sample Road',
			'Planning application reference: APP-45678',
			'',
			'# The site visit has changed',
			'',
			'You are now required to attend the site visit taking place at 55, Sample Road at 2:00pm on 19 June 2025.',
			'',
			'# Who will attend',
			'',
			'You will attend the visit with our inspector (or their representative) and a representative from the local planning authority.',
			'',
			'You will accompany the inspector throughout the visit.',
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
			'test@example.com',
			{
				content: expectedContent,
				subject: 'Change to inspector visit to appeal site: XYZ67890'
			}
		);
	});
});
