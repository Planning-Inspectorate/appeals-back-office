import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('proof-of-evidence-and-witnesses-shared.md', () => {
	test('should call notify sendEmail with the correct format with appellant', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'proof-of-evidence-and-witnesses-shared',
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
				inquiry_subject_line: ['local planning authority', 'appellant'],
				what_happens_next: 'appeals'
			}
		};

		const expectedContent = [
			'We have received proof of evidence and witnesses from:',
			'- local planning authority',
			'- appellant',
			'',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You can [view the proof of evidence and witnesses in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'',
			'The date of your inquiry is 13 December 2025',
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
				subject: 'We have received proof of evidence and witnesses: ABC45678'
			}
		);
	});

	test('should call notify sendEmail with the correct format with lpa', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'proof-of-evidence-and-witnesses-shared',
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
				inquiry_subject_line: ['appellant', 'local planning authority'],
				what_happens_next: 'manage-appeals'
			}
		};

		const expectedContent = [
			'We have received proof of evidence and witnesses from:',
			'- appellant',
			'- local planning authority',
			'',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You can [view the proof of evidence and witnesses in the appeals service](/mock-front-office-url/manage-appeals/ABC45678).',
			'',
			'The date of your inquiry is 13 December 2025',
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
				subject: 'We have received proof of evidence and witnesses: ABC45678'
			}
		);
	});
});
