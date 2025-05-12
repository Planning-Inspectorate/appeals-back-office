import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-accompanied-date-change-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-accompanied-date-change-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'appellant@example.com',
			personalisation: {
				appeal_reference_number: 'ABC12345',
				site_address: '12, New Site Lane',
				lpa_reference: 'REF-32100',
				visit_date: '30 August 2025',
				start_time: '9:00am'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC12345',
			'Address: 12, New Site Lane',
			'Planning application reference: REF-32100',
			'',
			'# The site visit has changed',
			'',
			'Our inspector (or their representative) will now visit 12, New Site Lane at 9:00am on 30 August 2025.',
			'',
			'# About the visit',
			'',
			'You cannot give the inspector any documents or discuss the appeal with them.',
			'',
			'# Who will attend',
			'',
			'You must attend the site visit with our inspector and a representative from the local planning authority.',
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
			'appellant@example.com',
			{
				content: expectedContent,
				subject: 'Rescheduled inspector visit to appeal site: ABC12345'
			}
		);
	});
});
