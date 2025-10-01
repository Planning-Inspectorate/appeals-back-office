import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('missed-site-visit-rearranged-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'missed-site-visit-rearranged-lpa',
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
			'We have rearranged your site visit at 10:30am on 12 June 2025.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: XYZ12345',
			'Address: 22, Example Lane',
			'Planning application reference: REF-67890',
			'',
			'# What happens next',
			'',
			'If you do not attend the site visit, you may need to pay appeal costs.',
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
				subject: 'Rearranged site visit: XYZ12345'
			}
		);
	});
});
