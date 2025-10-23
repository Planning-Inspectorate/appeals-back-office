import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('not-received-proof-of-evidence-and-witnesses.md', () => {
	test('should call notify sendEmail with the correct data inquiry address is present', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'not-received-proof-of-evidence-and-witnesses',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				inquiry_address: '10, Test Street, London, AH6 9KL',
				inquiry_date: '13 December 2025',
				inquiry_detail_warning_text:
					'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
				inquiry_expected_days: '8',
				inquiry_time: '2:00pm',
				inquiry_witnesses_text:
					'Your witnesses should be available for the duration of the inquiry.',
				inquiry_subject_line:
					'We did not receive any proof of evidence and witnesses from appellant or any other parties'
			}
		};

		const expectedContent = [
			'We did not receive any proof of evidence and witnesses from appellant or any other parties.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# About the inquiry',
			'',
			'^Date: 13 December 2025',
			'Time: 2:00pm',
			'Expected days: 8',
			'Venue address: 10, Test Street, London, AH6 9KL',
			'',
			'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
			'',
			'Your witnesses should be available for the duration of the inquiry.',
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
				subject:
					'We did not receive any proof of evidence and witnesses from appellant or any other parties: ABC45678'
			}
		);
	});

	test('should call notify sendEmail with the correct data inquiry address is not present', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'not-received-proof-of-evidence-and-witnesses',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				inquiry_address: '',
				inquiry_date: '13 December 2025',
				inquiry_detail_warning_text:
					'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
				inquiry_expected_days: '8',
				inquiry_time: '2:00pm',
				inquiry_witnesses_text:
					'Your witnesses should be available for the duration of the inquiry.',
				inquiry_subject_line:
					'We did not receive any proof of evidence and witnesses from appellant or any other parties'
			}
		};

		const expectedContent = [
			'We did not receive any proof of evidence and witnesses from appellant or any other parties.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# About the inquiry',
			'',
			'^Date: 13 December 2025',
			'Time: 2:00pm',
			'Expected days: 8',
			'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
			'',
			'Your witnesses should be available for the duration of the inquiry.',
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
				subject:
					'We did not receive any proof of evidence and witnesses from appellant or any other parties: ABC45678'
			}
		);
	});
});
