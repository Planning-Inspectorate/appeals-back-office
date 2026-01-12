import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-valid-start-case-advertisement-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-advertisement-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				start_date: '01 January 2025',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Householder',
				procedure_type: 'a written procedure',
				questionnaire_due_date: '31 January 2025',
				lpa_statement_deadline: '01 March 2025',
				ip_comments_deadline: '01 April 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'We have reviewed your appeal and supporting documents.',
			'',
			'Your appeal started on 01 January 2025. The timetable for the appeal begins from this date.',
			'',
			'Your appeal procedure is a written procedure.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# Timetable',
			'',
			'## Local planning authority questionnaire',
			'',
			'Due by 31 January 2025.',
			'',
			'## Statements',
			'',
			'Due by 01 March 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 01 April 2025.',
			'',
			'# What happens next',
			'',
			'Email a copy of your appeal statement to caseofficers@planninginspectorate.gov.uk by 31 January 2025. You will be able to view this in your appeal details.',
			'',
			'We will email you when you can view information from other parties in the appeals service.',
			'',
			'# Appeal costs',
			'',
			'You may have to pay costs if you:',
			'',
			'- behave unreasonably during your own appeal',
			'- withdraw your appeal without good reason',
			'- submit late evidence',
			'',
			'[Find out more about appeal costs](https://www.gov.uk/claim-planning-appeal-costs).',
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
				subject: 'Your appeal has started: 134526'
			}
		);
	});
});
