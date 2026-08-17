import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('final-comments-received-enforcement-hearing-appellant.md', () => {
	test('should call notify sendEmail with the correct data - hearing date set', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'final-comments-received-enforcement-hearing-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				hearing_date: '15 October 2025',
				hearing_time: '10:00 AM',
				hearing_expected_days: 5,
				inspector_name: 'John Doe',
				hearing_address: '10, Test Street, London, UK',
				front_office_url: '/mock-front-office-url'
			}
		};

		const expectedContent = [
			"We have received the local planning authority's final comments.",
			'',
			'You can [view this information in the appeal service](/mock-front-office-url/appeals/ABC45678).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# Hearing details',
			'Date: 15 October 2025',
			'Time: 10:00 AM',
			'Expected days: 5',
			'',
			'Inspector: John Doe',
			'',
			'Venue address: 10, Test Street, London, UK',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
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

	test('should call notify sendEmail with the correct data - no hearing date set', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'final-comments-received-enforcement-hearing-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				front_office_url: '/mock-front-office-url'
			}
		};

		const expectedContent = [
			"We have received the local planning authority's final comments.",
			'',
			'You can [view this information in the appeal service](/mock-front-office-url/appeals/ABC45678).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'We will contact you by email when we set up the hearing.',
			'',
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
