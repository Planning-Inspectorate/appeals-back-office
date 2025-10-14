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
				start_time: '10:30am',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: XYZ12345',
			'Address: 22, Example Lane',
			'Planning application reference: REF-67890',
			'',
			'# The site visit has changed',
			'',
			'Our inspector (or their representative) will now visit 22, Example Lane at 10:30am on 12 June 2025.',
			'',
			'# Giving the inspector access to the site',
			'',
			'You, or someone else, must be at the site at the scheduled time to provide access for our inspector.',
			'',
			'Alternatively, and only if it is possible at the site, you can provide written consent for access for our inspector at caseofficers@planninginspectorate.gov.uk.',
			'',
			'Include our appeal reference number in any communication.',
			'',
			'# About the visit',
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
			'test@example.com',
			{
				content: expectedContent,
				subject: 'Rescheduled inspector visit to appeal site: XYZ12345'
			}
		);
	});
});
