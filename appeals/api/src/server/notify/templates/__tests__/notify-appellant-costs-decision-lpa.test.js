import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appellant-costs-decision-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appellant-costs-decision-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				front_office_url: '/mock-front-office-url',
				feedback_link: '/mock-feedback-link'
			}
		};

		const expectedContent = [
			"We have made a decision on the appellant's application for an award of appeal costs.",
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# Appeal costs decision',
			'',
			'[Sign in to our service](/mock-front-office-url/manage-appeals/134526) to view the decision.',
			'',
			'We have also informed the appellant of the decision.',
			'',
			'# Feedback',
			'',
			'We welcome your feedback on our appeals service. Tell us on this short [feedback form](/mock-feedback-link).',
			'',
			'The Planning Inspectorate  ',
			'enquiries@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Appeal costs decision: 134526'
			}
		);
	});
});
