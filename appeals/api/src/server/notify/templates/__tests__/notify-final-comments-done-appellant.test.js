import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('final-comments-done-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'final-comments-done-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ'
			}
		};

		const expectedContent = [
			"We have received the local planning authority's final comments.",
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			"You can [view the local planning authority's final comments](/mock-front-office-url/appeals/ABC45678).",
			'',
			'The inspector will visit the site and we will contact you when we have made the decision.',
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
				subject: "We have received the local planning authority's final comments: ABC45678"
			}
		);
	});
});
