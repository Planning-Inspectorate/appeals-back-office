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
			'# Site visit scheduled',
			'',
			'We have now arranged for our inspector (or their representative) to visit 45, Hearing Road.',
			'',
			'You are not required to attend the site visit.',
			'',
			'# About the visit',
			'',
			'The purpose of the site visit is for the inspector to view the site and its surroundings.',
			'',
			'If you see the inspector, you cannot give them any documents or discuss the appeal with them. The inspector will carry out the inspection on their own.',
			'',
			'# What happens next',
			'',
			'We will contact you when the inspector makes a decision.',
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
