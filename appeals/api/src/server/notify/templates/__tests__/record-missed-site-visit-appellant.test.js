import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-access-required-date-change-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'record-missed-site-visit-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@example.com',
			personalisation: {
				appeal_reference_number: 'XYZ12345',
				site_address: '22, Example Lane',
				lpa_reference: 'REF-67890',
				visit_date: '12 June 2025',
				'5_day_deadline': '17 June 2025',
				start_time: '10:30am',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'Our inspector visited the site at 10:30am on 12 June 2025. Nobody was at the site to give the inspector access.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: XYZ12345',
			'Address: 22, Example Lane',
			'Planning application reference: REF-67890',
			'',
			'# What happens next',
			'',
			'Send an email to explain why you could not attend to caseofficers@planninginspectorate.gov.uk by 17 June 2025.',
			'',
			'If you missed your site visit without a good reason, we may dismiss your appeal.',
			'',
			'The Planning Inspectorate'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@example.com',
			{
				content: expectedContent,
				subject: 'Missed site visit: XYZ12345'
			}
		);
	});
});
