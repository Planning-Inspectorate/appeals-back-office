import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-access-required-to-unaccompanied-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-access-required-to-unaccompanied-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'appellant@example.com',
			personalisation: {
				appeal_reference_number: 'UVW98765',
				site_address: '9, Quiet Close',
				lpa_reference: 'PLN-11223',
				visit_date: '2 August 2025'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: UVW98765',
			'Address: 9, Quiet Close',
			'Planning application reference: PLN-11223',
			'',
			'# The site visit has changed',
			'',
			'You are no longer required to provide access to our inspector (or their representative) for the site visit to 9, Quiet Close on 2 August 2025.',
			'',
			'The inspector will now carry out the inspection on their own.',
			'',
			'# About the visit',
			'',
			'If you see the inspector, you cannot give them any documents or discuss the appeal with them.',
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
				subject: 'Change to inspector visit to appeal site: UVW98765'
			}
		);
	});
});
