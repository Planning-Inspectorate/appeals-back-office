import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-valid-start-case-enforcement-lpa.md', () => {
	test('should call notify sendEmail for an enforcement notice appeal', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-lpa',
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
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by written representations. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
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
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'[Find out your responsibilities in the appeal process](http://www.gov.uk/government/publications/planning-appeals-procedural-guide/procedural-guide-planning-appeals-england).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
				subject: 'New enforcement notice appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail for an enforcement notice appeal with multiple grounds', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-lpa',
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
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a', 'b'],
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by written representations. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
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
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'[Find out your responsibilities in the appeal process](http://www.gov.uk/government/publications/planning-appeals-procedural-guide/procedural-guide-planning-appeals-england).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
				subject: 'New enforcement notice appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail for an enforcement notice appeal with a planning obligation', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-lpa',
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
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				planning_obligation_deadline: '25 January 2025'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by written representations. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
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
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'[Find out your responsibilities in the appeal process](http://www.gov.uk/government/publications/planning-appeals-procedural-guide/procedural-guide-planning-appeals-england).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
				subject: 'New enforcement notice appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail for a linked appeal with one child appeal', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-lpa',
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
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				child_appeals: ['656565'],
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by written representations. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
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
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'[Find out your responsibilities in the appeal process](http://www.gov.uk/government/publications/planning-appeals-procedural-guide/procedural-guide-planning-appeals-england).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
				subject: 'New enforcement notice appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail for a linked appeal with multiple child appeals', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-lpa',
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
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by written representations. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
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
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'[Find out your responsibilities in the appeal process](http://www.gov.uk/government/publications/planning-appeals-procedural-guide/procedural-guide-planning-appeals-england).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
				subject: 'New enforcement notice appeal: 134526'
			}
		);
	});
});
