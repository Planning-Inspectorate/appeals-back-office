import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-schedule-accompanied-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-schedule-accompanied-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'appellant@example.com',
			personalisation: {
				appeal_reference_number: 'AAA11234',
				site_address: '45, Hearing Road',
				lpa_reference: 'PLAN-12345',
				visit_date: '15 October 2025',
				start_time: '11:00am',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: AAA11234',
			'Address: 45, Hearing Road',
			'Planning application reference: PLAN-12345',
			'',
			'# About the visit',
			'',
			'Our inspector (or their representative) will visit 45, Hearing Road at 11:00am on 15 October 2025.',
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
				subject: 'Inspector visit to appeal site: AAA11234'
			}
		);
	});
});
