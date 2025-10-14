import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('lpaq-complete-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'lpaq-complete-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			"We have received the local planning authority's questionnaire.",
			'',
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'We will send you another email when the local planning authority submits their statement and we receive any comments from interested parties.',
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
				subject: "View the local planning authority's questionnaire: ABC45678"
			}
		);
	});
});
