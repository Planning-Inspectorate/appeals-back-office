import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('change-procedure-type.md', () => {
	test('should call notify sendEmail with the correct data if written procedure and appellant', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'change-procedure-type',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				appeal_procedure: 'written',
				change_message:
					'We have changed your appeal procedure to written representations and cancelled your hearing.',
				lpa_statement_exists: true,
				is_lpa: false,
				subject: 'We have changed your appeal procedure: ABC45678'
			}
		};

		const expectedContent = [
			'We have changed your appeal procedure to written representations and cancelled your hearing.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'We will send you another email when:',
			'• you can [submit your final comments](/mock-front-office-url/manage-appeals/ABC45678)',
			'• we set up the site visit',
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
				subject: 'We have changed your appeal procedure: ABC45678'
			}
		);
	});

	test('should call notify sendEmail with the correct data if written procedure and LPA with LPA statement existing', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'change-procedure-type',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				appeal_procedure: 'written',
				change_message:
					'We have changed your appeal procedure to written representations and cancelled your hearing.',
				lpa_statement_exists: true,
				is_lpa: true,
				subject: 'We have changed your appeal procedure: ABC45678'
			}
		};

		const expectedContent = [
			'We have changed your appeal procedure to written representations and cancelled your hearing.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit a new statement](/mock-front-office-url/manage-appeals/ABC45678).',
			'',
			'We will send you another email when:',
			'• you can [submit your final comments](/mock-front-office-url/manage-appeals/ABC45678)',
			'• we set up the site visit',
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
				subject: 'We have changed your appeal procedure: ABC45678'
			}
		);
	});

	test('should call notify sendEmail with the correct data if written procedure and LPA with LPA statement not existing', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'change-procedure-type',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				appeal_procedure: 'written',
				change_message:
					'We have changed your appeal procedure to written representations and cancelled your hearing.',
				lpa_statement_exists: false,
				is_lpa: true,
				subject: 'We have changed your appeal procedure: ABC45678'
			}
		};

		const expectedContent = [
			'We have changed your appeal procedure to written representations and cancelled your hearing.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'We will send you another email when:',
			'• you can [submit your final comments](/mock-front-office-url/manage-appeals/ABC45678)',
			'• we set up the site visit',
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
				subject: 'We have changed your appeal procedure: ABC45678'
			}
		);
	});
});
