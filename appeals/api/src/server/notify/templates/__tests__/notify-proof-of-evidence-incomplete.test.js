import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('proof-of-evidence-incomplete.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'proof-of-evidence-incomplete',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				deadline_date: '01 January 2021',
				reasons: ['Reason one', 'Reason two', 'Reason three'],
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We need more information with your proof of evidence and witnesses.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What we need',
			'',
			'- Reason one',
			'- Reason two',
			'- Reason three',
			'',
			'# What happens next',
			'',
			'You can send your updated proof of evidence and witnesses to caseofficers@planninginspectorate.gov.uk by 01 January 2021.',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'We need more information: ABC45678'
			}
		);
	});
});
