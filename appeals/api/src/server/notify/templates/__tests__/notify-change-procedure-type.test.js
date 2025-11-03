import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('change-procedure-type.md', () => {
	describe('change to written', () => {
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
	describe('change to inquiry', () => {
		test('should call notify sendEmail with the correct data if changing from written to inquiry procedure and is LPA', async () => {
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
					appeal_procedure: 'inquiry',
					change_message:
						'We have changed your appeal procedure to inquiry and cancelled your site visit.',
					lpa_statement_exists: true,
					is_lpa: true,
					subject: 'We have changed your appeal procedure: ABC45678',
					inquiry_date: '31 March 2024',
					inquiry_time: '1pm',
					inquiry_expected_days: '10',
					inquiry_address: '1 Inquiry Way, Inquiry IQ1 1QI',
					week_before_conference_date: '23 March 2024',
					proof_of_evidence_due_date: '20 March 2024',
					existing_appeal_procedure: 'written'
				}
			};

			const expectedContent = [
				'We have changed your appeal procedure to inquiry and cancelled your site visit.',
				'',
				'# Appeal details',
				'',
				'^Appeal reference number: ABC45678',
				'Address: 10, Test Street',
				'Planning application reference: 12345XYZ',
				'',
				'# Inquiry details',
				'',
				'^Date: 31 March 2024',
				'Time: 1pm',
				'Expected days: 10',
				'Venue address: 1 Inquiry Way, Inquiry IQ1 1QI',
				'',
				'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
				'',
				'Your witnesses should be available for the duration of the inquiry.',
				'',
				'# Before the inquiry',
				'',
				'The inspector will hold a case management conference with the main parties on Teams.',
				'',
				'We will send an email with the conference details. You should only have one spokesperson.',
				'',
				'# What happens next',
				'',
				'You need to:',
				'',
				'• You need to [submit a new statement](/mock-front-office-url/manage-appeals/ABC45678).',
				'• send the contact details of your spokesperson and any other participants to caseofficers@planninginspectorate.gov.uk by 23 March 2024',
				'• [submit proof of evidence and witnesses](/mock-front-office-url/manage-appeals/ABC45678) by 20 March 2024',
				'• attend the inquiry on 31 March 2024',
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

		test('should call notify sendEmail with the correct data if changing from written to inquiry procedure and is appellant', async () => {
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
					appeal_procedure: 'inquiry',
					change_message:
						'We have changed your appeal procedure to inquiry and cancelled your site visit.',
					lpa_statement_exists: true,
					is_lpa: false,
					subject: 'We have changed your appeal procedure: ABC45678',
					inquiry_date: '31 March 2024',
					inquiry_time: '1pm',
					inquiry_expected_days: '10',
					inquiry_address: '1 Inquiry Way, Inquiry IQ1 1QI',
					week_before_conference_date: '23 March 2024',
					proof_of_evidence_due_date: '20 March 2024',
					existing_appeal_procedure: 'written'
				}
			};

			const expectedContent = [
				'We have changed your appeal procedure to inquiry and cancelled your site visit.',
				'',
				'# Appeal details',
				'',
				'^Appeal reference number: ABC45678',
				'Address: 10, Test Street',
				'Planning application reference: 12345XYZ',
				'',
				'# Inquiry details',
				'',
				'^Date: 31 March 2024',
				'Time: 1pm',
				'Expected days: 10',
				'Venue address: 1 Inquiry Way, Inquiry IQ1 1QI',
				'',
				'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
				'',
				'Your witnesses should be available for the duration of the inquiry.',
				'',
				'# Before the inquiry',
				'',
				'The inspector will hold a case management conference with the main parties on Teams.',
				'',
				'We will send an email with the conference details. You should only have one spokesperson.',
				'',
				'# What happens next',
				'',
				'You need to:',
				'',
				'• send the contact details of your spokesperson and any other participants to caseofficers@planninginspectorate.gov.uk by 23 March 2024',
				'• [submit proof of evidence and witnesses](/mock-front-office-url/manage-appeals/ABC45678) by 20 March 2024',
				'• attend the inquiry on 31 March 2024',
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

		test('should call notify sendEmail with the correct data if changing from hearing to inquiry procedure and is LPA', async () => {
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
					appeal_procedure: 'inquiry',
					change_message:
						'We have changed your appeal procedure to inquiry and cancelled your hearing.',
					lpa_statement_exists: true,
					is_lpa: true,
					subject: 'We have changed your appeal procedure: ABC45678',
					inquiry_date: '31 March 2024',
					inquiry_time: '1pm',
					inquiry_expected_days: '10',
					inquiry_address: '1 Inquiry Way, Inquiry IQ1 1QI',
					week_before_conference_date: '23 March 2024',
					proof_of_evidence_due_date: '20 March 2024',
					existing_appeal_procedure: 'hearing'
				}
			};

			const expectedContent = [
				'We have changed your appeal procedure to inquiry and cancelled your hearing.',
				'',
				'# Appeal details',
				'',
				'^Appeal reference number: ABC45678',
				'Address: 10, Test Street',
				'Planning application reference: 12345XYZ',
				'',
				'# Inquiry details',
				'',
				'^Date: 31 March 2024',
				'Time: 1pm',
				'Expected days: 10',
				'Venue address: 1 Inquiry Way, Inquiry IQ1 1QI',
				'',
				'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
				'',
				'Your witnesses should be available for the duration of the inquiry.',
				'',
				'# Before the inquiry',
				'',
				'The inspector will hold a case management conference with the main parties on Teams.',
				'',
				'We will send an email with the conference details. You should only have one spokesperson.',
				'',
				'# What happens next',
				'',
				'You need to [submit a new statement](/mock-front-office-url/manage-appeals/ABC45678).',
				'',
				'We will send you another email when you can [submit your proof of evidence and witnesses](/mock-front-office-url/manage-appeals/ABC45678).',
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

		test('should call notify sendEmail with the correct data if changing from hearing to inquiry procedure and is appellant', async () => {
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
					appeal_procedure: 'inquiry',
					change_message:
						'We have changed your appeal procedure to inquiry and cancelled your hearing.',
					lpa_statement_exists: true,
					is_lpa: false,
					subject: 'We have changed your appeal procedure: ABC45678',
					inquiry_date: '31 March 2024',
					inquiry_time: '1pm',
					inquiry_expected_days: '10',
					inquiry_address: '1 Inquiry Way, Inquiry IQ1 1QI',
					week_before_conference_date: '23 March 2024',
					proof_of_evidence_due_date: '20 March 2024',
					existing_appeal_procedure: 'hearing'
				}
			};

			const expectedContent = [
				'We have changed your appeal procedure to inquiry and cancelled your hearing.',
				'',
				'# Appeal details',
				'',
				'^Appeal reference number: ABC45678',
				'Address: 10, Test Street',
				'Planning application reference: 12345XYZ',
				'',
				'# Inquiry details',
				'',
				'^Date: 31 March 2024',
				'Time: 1pm',
				'Expected days: 10',
				'Venue address: 1 Inquiry Way, Inquiry IQ1 1QI',
				'',
				'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
				'',
				'Your witnesses should be available for the duration of the inquiry.',
				'',
				'# Before the inquiry',
				'',
				'The inspector will hold a case management conference with the main parties on Teams.',
				'',
				'We will send an email with the conference details. You should only have one spokesperson.',
				'',
				'# What happens next',
				'',
				'We will send you another email when you can [submit your proof of evidence and witnesses](/mock-front-office-url/manage-appeals/ABC45678).',
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

		test('should call notify sendEmail with the correct data if changing from written to inquiry and LPA with LPA statement not existing', async () => {
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
					appeal_procedure: 'inquiry',
					change_message:
						'We have changed your appeal procedure to inquiry and cancelled your site visit.',
					lpa_statement_exists: false,
					is_lpa: true,
					subject: 'We have changed your appeal procedure: ABC45678',
					inquiry_date: '31 March 2024',
					inquiry_time: '1pm',
					inquiry_expected_days: '10',
					inquiry_address: '1 Inquiry Way, Inquiry IQ1 1QI',
					week_before_conference_date: '23 March 2024',
					proof_of_evidence_due_date: '20 March 2024',
					existing_appeal_procedure: 'written'
				}
			};

			const expectedContent = [
				'We have changed your appeal procedure to inquiry and cancelled your site visit.',
				'',
				'# Appeal details',
				'',
				'^Appeal reference number: ABC45678',
				'Address: 10, Test Street',
				'Planning application reference: 12345XYZ',
				'',
				'# Inquiry details',
				'',
				'^Date: 31 March 2024',
				'Time: 1pm',
				'Expected days: 10',
				'Venue address: 1 Inquiry Way, Inquiry IQ1 1QI',
				'',
				'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
				'',
				'Your witnesses should be available for the duration of the inquiry.',
				'',
				'# Before the inquiry',
				'',
				'The inspector will hold a case management conference with the main parties on Teams.',
				'',
				'We will send an email with the conference details. You should only have one spokesperson.',
				'',
				'# What happens next',
				'',
				'You need to:',
				'',
				'• send the contact details of your spokesperson and any other participants to caseofficers@planninginspectorate.gov.uk by 23 March 2024',
				'• [submit proof of evidence and witnesses](/mock-front-office-url/manage-appeals/ABC45678) by 20 March 2024',
				'• attend the inquiry on 31 March 2024',
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

		test('should call notify sendEmail with the correct data if changing from hearing to inquiry and LPA with LPA statement not existing', async () => {
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
					appeal_procedure: 'inquiry',
					change_message:
						'We have changed your appeal procedure to inquiry and cancelled your hearing.',
					lpa_statement_exists: true,
					is_lpa: false,
					subject: 'We have changed your appeal procedure: ABC45678',
					inquiry_date: '31 March 2024',
					inquiry_time: '1pm',
					inquiry_expected_days: '10',
					inquiry_address: '1 Inquiry Way, Inquiry IQ1 1QI',
					week_before_conference_date: '23 March 2024',
					proof_of_evidence_due_date: '20 March 2024',
					existing_appeal_procedure: 'hearing'
				}
			};

			const expectedContent = [
				'We have changed your appeal procedure to inquiry and cancelled your hearing.',
				'',
				'# Appeal details',
				'',
				'^Appeal reference number: ABC45678',
				'Address: 10, Test Street',
				'Planning application reference: 12345XYZ',
				'',
				'# Inquiry details',
				'',
				'^Date: 31 March 2024',
				'Time: 1pm',
				'Expected days: 10',
				'Venue address: 1 Inquiry Way, Inquiry IQ1 1QI',
				'',
				'The details of the inquiry are subject to change. We will contact you by email if we make any changes.',
				'',
				'Your witnesses should be available for the duration of the inquiry.',
				'',
				'# Before the inquiry',
				'',
				'The inspector will hold a case management conference with the main parties on Teams.',
				'',
				'We will send an email with the conference details. You should only have one spokesperson.',
				'',
				'# What happens next',
				'',
				'We will send you another email when you can [submit your proof of evidence and witnesses](/mock-front-office-url/manage-appeals/ABC45678).',
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
});
