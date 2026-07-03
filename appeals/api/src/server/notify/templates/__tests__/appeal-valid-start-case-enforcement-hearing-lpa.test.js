import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-valid-start-case-enforcement-hearing-lpa.md', () => {
	test('should call notify sendEmail for an enforcement notice hearing appeal', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-hearing-lpa',
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
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				hearing_date: '01 February 2025',
				hearing_time: '10:30am',
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
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
			'',
			'# Grounds of appeal',
			'',
			'The appeal will continue on the following grounds:',
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
			'# Hearing details',
			'',
			'^Date: 01 February 2025',
			'Time: 10:30am',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the hearing.',
			'',
			'[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
			'Planning Inspectorate',
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

	test('should call notify sendEmail for an enforcement notice hearing appeal with multiple grounds', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-hearing-lpa',
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
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a', 'b'],
				hearing_date: '01 February 2025',
				hearing_time: '10:30am',
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
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
			'',
			'# Grounds of appeal',
			'',
			'The appeal will continue on the following grounds:',
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
			'# Hearing details',
			'',
			'^Date: 01 February 2025',
			'Time: 10:30am',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the hearing.',
			'',
			'[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
			'Planning Inspectorate',
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

	test('should call notify sendEmail for an enforcement hearing appeal with inspector', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-hearing-lpa',
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
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a', 'b'],
				hearing_date: '01 February 2025',
				hearing_time: '10:30am',
				inspector_name: 'Inspector Gadget',
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
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
			'',
			'# Grounds of appeal',
			'',
			'The appeal will continue on the following grounds:',
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
			'# Hearing details',
			'',
			'^Date: 01 February 2025',
			'Time: 10:30am',
			'Inspector: Inspector Gadget',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the hearing.',
			'',
			'[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
			'Planning Inspectorate',
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

	test('should call notify sendEmail for an enforcement hearing appeal with hearing estimate', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-hearing-lpa',
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
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a', 'b'],
				hearing_date: '01 February 2025',
				hearing_time: '10:30am',
				hearing_expected_days: '2',
				inspector_name: 'Inspector Gadget',
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
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
			'',
			'# Grounds of appeal',
			'',
			'The appeal will continue on the following grounds:',
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
			'# Hearing details',
			'',
			'^Date: 01 February 2025',
			'Time: 10:30am',
			'Expected days: 2',
			'Inspector: Inspector Gadget',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the hearing.',
			'',
			'[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
			'Planning Inspectorate',
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

	test('should call notify sendEmail for a linked enforcement hearing appeal with one child appeal', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-hearing-lpa',
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
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				child_appeals: ['656565'],
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a', 'b'],
				hearing_date: '01 February 2025',
				hearing_time: '10:30am',
				hearing_expected_days: '2',
				inspector_name: 'Inspector Gadget',
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
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
			'',
			'# Grounds of appeal',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'- Ground (a)',
			'- Ground (b)',
			'',
			'# Timetable',
			'',
			'The timetable is the same for the linked appeal 656565.',
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
			'# Hearing details',
			'',
			'^Date: 01 February 2025',
			'Time: 10:30am',
			'Expected days: 2',
			'Inspector: Inspector Gadget',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the hearing.',
			'',
			'[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
			'Planning Inspectorate',
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

	test('should call notify sendEmail for a linked enforcement hearing appeal with multiple child appeals', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-hearing-lpa',
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
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				child_appeals: ['111111', '222222', '333333'],
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				hearing_date: '01 February 2025',
				hearing_time: '10:30am',
				hearing_expected_days: '2',
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
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
			'',
			'# Grounds of appeal',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'Ground (a)',
			'',
			'# Timetable',
			'',
			'The timetable is the same for the following linked appeals:',
			'- 111111',
			'- 222222',
			'- 333333',
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
			'# Hearing details',
			'',
			'^Date: 01 February 2025',
			'Time: 10:30am',
			'Expected days: 2',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the hearing.',
			'',
			'[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
			'Planning Inspectorate',
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

	test('should call notify sendEmail for a linked enforcement hearing appeal with multiple child appeals, other appeal grounds group is empty', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-hearing-lpa',
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
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				child_appeals: ['111111', '222222', '333333'],
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				other_appeals_grounds_group: [],
				hearing_date: '01 February 2025',
				hearing_time: '10:30am',
				hearing_expected_days: '2',
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
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
			'',
			'# Grounds of appeal',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'Ground (a)',
			'',
			'# Timetable',
			'',
			'The timetable is the same for the following linked appeals:',
			'- 111111',
			'- 222222',
			'- 333333',
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
			'# Hearing details',
			'',
			'^Date: 01 February 2025',
			'Time: 10:30am',
			'Expected days: 2',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the hearing.',
			'',
			'[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
			'Planning Inspectorate',
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

	test('should call notify sendEmail for a linked enforcement hearing appeal with multiple child appeals, one other appeal with grounds', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-hearing-lpa',
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
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				child_appeals: ['111111', '222222', '333333'],
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				other_appeals_grounds_group: [{ reference: '111111', grounds: ['b'] }],
				hearing_date: '01 February 2025',
				hearing_time: '10:30am',
				hearing_expected_days: '2',
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
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
			'',
			'# Grounds of appeal',
			'',
			'134526 will continue on the following grounds:',
			'',
			'Ground (a)',
			'',
			'111111 will continue on the following grounds:',
			'',
			'Ground (b)',
			'',
			'# Timetable',
			'',
			'The timetable is the same for the following linked appeals:',
			'- 111111',
			'- 222222',
			'- 333333',
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
			'# Hearing details',
			'',
			'^Date: 01 February 2025',
			'Time: 10:30am',
			'Expected days: 2',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the hearing.',
			'',
			'[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
			'Planning Inspectorate',
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

	test('should call notify sendEmail for a linked enforcement hearing appeal with multiple child appeals, multiple other appeals with grounds', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-enforcement-hearing-lpa',
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
				procedure_type: 'a hearing',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				child_appeals: ['111111', '222222', '333333'],
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				other_appeals_grounds_group: [
					{ reference: '111111', grounds: ['b'] },
					{ reference: '222222', grounds: ['c', 'd'] },
					{ reference: '333333', grounds: [] },
					{ reference: '444444', grounds: [] },
					{ reference: '555555', grounds: [] }
				],
				hearing_date: '01 February 2025',
				hearing_time: '10:30am',
				hearing_expected_days: '2',
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
			'You have a new enforcement notice appeal against 12345/ENF/1234/1234.',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Start date: 01 January 2025',
			'',
			'# Grounds of appeal',
			'',
			'134526 will continue on the following grounds:',
			'',
			'Ground (a)',
			'',
			'111111 will continue on the following grounds:',
			'',
			'Ground (b)',
			'',
			'222222 will continue on the following grounds:',
			'',
			'- Ground (c)',
			'- Ground (d)',
			'',
			'# Timetable',
			'',
			'The timetable is the same for the following linked appeals:',
			'- 111111',
			'- 222222',
			'- 333333',
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
			'# Hearing details',
			'',
			'^Date: 01 February 2025',
			'Time: 10:30am',
			'Expected days: 2',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the hearing.',
			'',
			'[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Notifications',
			'',
			'You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.',
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
			'Planning Inspectorate',
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
