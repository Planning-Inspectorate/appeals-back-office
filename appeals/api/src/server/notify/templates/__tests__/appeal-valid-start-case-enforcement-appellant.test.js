import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-valid-start-case-enforcement-appellant.md', () => {
	test('should call notify sendEmail for an enforcement notice appeal', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-appellant',
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
				appeal_type: 'Enforcement notice',
				procedure_type: 'written representations',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				front_office_url: '/mock-front-office-url'
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
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'',
			'# Grounds of appeal',
			'',
			'Ground (a)',
			'',
			'# Timetable',
			'',
			'## Local planning authority questionnaire',
			'',
			'Due by 01 January 2025.',
			'',
			'## Statements',
			'',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 20 January 2025.',
			'',
			'## Final comments',
			'',
			'Due by 30 January 2025.',
			'',
			'# What happens next',
			'',
			'You need to [submit your statement](/mock-front-office-url) by 10 January 2025.',
			'',
			'We will send you an email when you can view information from other parties in the appeals service.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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

	test('should call notify sendEmail for an enforcement notice appeal with multiple grounds', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-appellant',
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
				appeal_type: 'Enforcement notice',
				procedure_type: 'written representations',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a', 'b'],
				front_office_url: '/mock-front-office-url'
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
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'',
			'# Grounds of appeal',
			'',
			'- Ground (a)',
			'- Ground (b)',
			'',
			'# Timetable',
			'',
			'## Local planning authority questionnaire',
			'',
			'Due by 01 January 2025.',
			'',
			'## Statements',
			'',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 20 January 2025.',
			'',
			'## Final comments',
			'',
			'Due by 30 January 2025.',
			'',
			'# What happens next',
			'',
			'You need to [submit your statement](/mock-front-office-url) by 10 January 2025.',
			'',
			'We will send you an email when you can view information from other parties in the appeals service.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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

	test('should call notify sendEmail for an enforcement notice appeal with planning obligation', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-appellant',
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
				appeal_type: 'Enforcement notice',
				procedure_type: 'written representations',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				planning_obligation_deadline: '25 January 2025',
				front_office_url: '/mock-front-office-url'
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
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'',
			'# Grounds of appeal',
			'',
			'Ground (a)',
			'',
			'# Timetable',
			'',
			'## Local planning authority questionnaire',
			'',
			'Due by 01 January 2025.',
			'',
			'## Statements',
			'',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 20 January 2025.',
			'',
			'## Planning obligation',
			'',
			'Send to caseofficers@planninginspectorate.gov.uk by 25 January 2025.',
			'',
			'## Final comments',
			'',
			'Due by 30 January 2025.',
			'',
			'# What happens next',
			'',
			'You need to [submit your statement](/mock-front-office-url) by 10 January 2025.',
			'',
			'We will send you an email when you can view information from other parties in the appeals service.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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

	test('should call notify sendEmail for a linked appeal with one child appeal', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-appellant',
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
				appeal_type: 'Enforcement notice',
				procedure_type: 'written representations',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				child_appeals: ['656565'],
				we_will_email_when: 'as this is a test',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				front_office_url: '/mock-front-office-url'
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
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'',
			'# Grounds of appeal',
			'',
			'Ground (a)',
			'',
			'# Timetable',
			'',
			'The timetable is the same for the child appeal 656565.',
			'',
			'## Local planning authority questionnaire',
			'',
			'Due by 01 January 2025.',
			'',
			'## Statements',
			'',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 20 January 2025.',
			'',
			'## Final comments',
			'',
			'Due by 30 January 2025.',
			'',
			'# What happens next',
			'',
			'You need to [submit your statement](/mock-front-office-url) by 10 January 2025.',
			'',
			'We will send you an email when you can view information from other parties in the appeals service.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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

	test('should call notify sendEmail for a linked appeal with multiple child appeals', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-appellant',
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
				appeal_type: 'Enforcement notice',
				procedure_type: 'written representations',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				child_appeals: ['111111', '222222', '333333', '444444', '555555'],
				appeal_grounds: ['a'],
				enforcement_reference: '12345/ENF/1234/1234',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				front_office_url: '/mock-front-office-url'
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
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'',
			'# Grounds of appeal',
			'',
			'Ground (a)',
			'',
			'# Timetable',
			'',
			'The timetable is the same for the following child appeals:',
			'- 111111',
			'- 222222',
			'- 333333',
			'- 444444',
			'- 555555',
			'',
			'## Local planning authority questionnaire',
			'',
			'Due by 01 January 2025.',
			'',
			'## Statements',
			'',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 20 January 2025.',
			'',
			'## Final comments',
			'',
			'Due by 30 January 2025.',
			'',
			'# What happens next',
			'',
			'You need to [submit your statement](/mock-front-office-url) by 10 January 2025.',
			'',
			'We will send you an email when you can view information from other parties in the appeals service.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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
