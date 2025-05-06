import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-access-required-date-change-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-access-required-date-change-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@example.com',
			personalisation: {
				appeal_reference_number: 'XYZ12345',
				site_address: '22, Example Lane',
				lpa_reference: 'REF-67890',
				visit_date: '12 June 2025',
				start_time: '10:30am'
			}
		};

		const expectedContent = [
			'#Appeal details',
			'',
			'^Appeal reference number: XYZ12345',
			'Address: 22, Example Lane',
			'Planning application reference: REF-67890',
			'',
			'# The site visit has changed',
			'',
			'Our inspector (or their representative) will now visit 22, Example Lane at 10:30am on 12 June 2025.',
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
			'test@example.com',
			{
				content: expectedContent,
				subject: 'Rescheduled inspector visit to appeal site: XYZ12345'
			}
		);
	});
});
