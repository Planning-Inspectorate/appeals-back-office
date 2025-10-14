import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-accompanied-to-unaccompanied-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-accompanied-to-unaccompanied-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'appellant@example.com',
			personalisation: {
				appeal_reference_number: 'MNO11223',
				site_address: '66, Solitude Way',
				lpa_reference: 'PLN-34567',
				visit_date: '18 September 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: MNO11223',
			'Address: 66, Solitude Way',
			'Planning application reference: PLN-34567',
			'',
			'# The site visit has changed',
			'',
			'You are no longer required to accompany our inspector (or their representative) on the site visit to 66, Solitude Way on 18 September 2025.',
			'',
			'The inspector will carry out the inspection on their own.',
			'',
			'# About the visit',
			'',
			'If you see the inspector, you cannot give them any documents or discuss the appeal with them.',
			'',
			'If you need to contact us, include our reference number in any communication.',
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
				subject: 'Change to inspector visit at appeal site: MNO11223'
			}
		);
	});
});
