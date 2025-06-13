import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-valid-start-case-s78-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-s78-appellant',
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
				procedure_type: 'written representations',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				we_will_email_when:
					'when you can view information from other parties in the appeals service.'
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
			'Your appeal procedure is written representations.',
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
			'Due by 01 January 2025.',
			'',
			'## Statements from the local planning authority',
			'',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 20 January 2025.',
			'',
			'## Final comments from you and the local planning authority',
			'',
			'Due by 30 January 2025.',
			'',
			'# What happens next',
			'',
			'We will send you an email when you can view information from other parties in the appeals service.',
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
				subject: 'We have started your appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail for a hearing appeal', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-s78-appellant',
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
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				we_will_email_when: [
					'to let you know when you can view information from other parties in the appeals service',
					'when we set up your hearing'
				]
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
			'Your appeal procedure is a hearing.',
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
			'Due by 01 January 2025.',
			'',
			'## Statements from the local planning authority',
			'',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 20 January 2025.',
			'',
			'# What happens next',
			'',
			'We will send you another email:',
			'',
			'- to let you know when you can view information from other parties in the appeals service',
			'- when we set up your hearing',
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
				subject: 'We have started your appeal: 134526'
			}
		);
	});
});
