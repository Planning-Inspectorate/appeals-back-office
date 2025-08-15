import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('link-appeal.md', () => {
	test('should call notify sendEmail with generic details if appeal status before lpa_questionnaire', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'link-appeal',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				lead_appeal_reference_number: 'ABC45678',
				child_appeal_reference_number: 'XYZ45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				event_type: 'site visit',
				linked_before_lpa_questionnaire: true
			}
		};

		const expectedContent = [
			'We have linked the child appeal XYZ45678 to the lead appeal ABC45678.',
			'',
			'All of the linked appeals will use the timetable for the lead appeal ABC45678.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'We will contact you again when we start the appeal.',
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
				subject: 'We have linked the appeal: ABC45678'
			}
		);
	});

	test('should call notify sendEmail with event details if appeal status is lpa_questionnaire', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'link-appeal',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				lead_appeal_reference_number: 'ABC45678',
				child_appeal_reference_number: 'XYZ45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				event_type: 'site visit',
				linked_before_lpa_questionnaire: false
			}
		};

		const expectedContent = [
			'We have linked the child appeal XYZ45678 to the lead appeal ABC45678.',
			'',
			'All of the linked appeals will use the timetable for the lead appeal ABC45678.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'There will be one site visit for all of the linked appeals.',
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
				subject: 'We have linked the appeal: ABC45678'
			}
		);
	});
});
