import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-schedule-access-required-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-schedule-access-required-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'appellant@example.com',
			personalisation: {
				appeal_reference_number: 'ZZZ99123',
				site_address: '18, Field Lane',
				lpa_reference: 'LPA-77889',
				visit_date: '9 October 2025',
				start_time: '8:30am',
				end_time: '12:30pm',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ZZZ99123',
			'Address: 18, Field Lane',
			'Planning application reference: LPA-77889',
			'',
			'# When we will visit',
			'',
			'The inspector (or their representative) will visit 18, Field Lane between 8:30am and 12:30pm on 9 October 2025.',
			'',
			'# Give the inspector access to the site',
			'',
			'Someone must be at the site at the scheduled time to give the inspector access to the site.',
			'',
			'If nobody is available, you can give written consent for the inspector to access the site by themselves. Explain how the inspector can safely access the site with your consent.',
			'',
			'In all cases, email caseofficers@planninginspectorate.gov.uk to either give:',
			'',
			'- the details of who will be at the site to give the inspector access',
			'- your consent for the inspector to access the site by themselves',
			'',
			'Include your appeal reference number in the subject of your email: ZZZ99123.',
			'',
			'# About the visit',
			'',
			'The purpose of the site visit is for the inspector to view the site and its surroundings. You are only required to give the inspector access to the site.',
			'',
			'You cannot give the inspector any documents or discuss the appeal with them.',
			'',
			'The inspector will carry out the inspection on their own.',
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
				subject: 'Inspector visit to appeal site: ZZZ99123'
			}
		);
	});
});
