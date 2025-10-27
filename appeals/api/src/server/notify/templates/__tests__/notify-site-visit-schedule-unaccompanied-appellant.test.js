import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-schedule-unaccompanied-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-schedule-unaccompanied-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'appellant@example.com',
			personalisation: {
				appeal_reference_number: 'CCC33445',
				site_address: '61, Viewpoint Hill',
				lpa_reference: 'PLAN-98765',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: CCC33445',
			'Address: 61, Viewpoint Hill',
			'Planning application reference: PLAN-98765',
			'',
			'# Site visit scheduled',
			'',
			'We have now arranged for our inspector (or their representative) to visit 61, Viewpoint Hill.',
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
				subject: 'Inspector visit to appeal site: CCC33445'
			}
		);
	});
});
