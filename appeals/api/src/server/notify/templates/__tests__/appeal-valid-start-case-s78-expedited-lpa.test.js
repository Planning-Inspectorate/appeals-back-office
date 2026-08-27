import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-valid-start-case-s78-expedited-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-s78-expedited-lpa',
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
				appeal_type: 'Planning',
				procedure_type: 'written representations (Part 1)',
				questionnaire_due_date: '01 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'You have a new planning appeal against the application 48269/APP/2021/1482.',
			'',
			'We will decide the appeal by written representations (Part 1).',
			'',
			'There will be no local planning authority statement, interested party comments or final comments.',
			'',
			'You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'Start date: 01 January 2025',
			'',
			'# Timetable',
			'',
			'## Local planning authority questionnaire',
			'',
			'Due by 01 January 2025.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire](/mock-front-office-url/manage-appeals/134526), including the appropriate appeal notification letter by 01 January 2025.',
			'',
			'You do not need to ask interested parties for comments when you notify them.',
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
				subject: 'New planning appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail for a linked appeal with one child appeal', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-s78-expedited-lpa',
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
				appeal_type: 'Planning',
				procedure_type: 'written representations (Part 1)',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
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
			'You have a new planning appeal against the application 48269/APP/2021/1482.',
			'',
			'We will decide the appeal by written representations (Part 1).',
			'',
			'There will be no local planning authority statement, interested party comments or final comments.',
			'',
			'You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'Start date: 01 January 2025',
			'',
			'# Timetable',
			'',
			'The timetable is the same for the child appeal 656565.',
			'',
			'## Local planning authority questionnaire',
			'',
			'Due by 01 January 2025.',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire](/mock-front-office-url/manage-appeals/134526), including the appropriate appeal notification letter by 01 January 2025.',
			'',
			'You do not need to ask interested parties for comments when you notify them.',
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
				subject: 'New planning appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail for a linked appeal with multiple child appeals', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-s78-expedited-lpa',
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
				appeal_type: 'Planning',
				procedure_type: 'written representations (Part 1)',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				child_appeals: ['111111', '222222', '333333', '444444', '555555'],
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'You have a new planning appeal against the application 48269/APP/2021/1482.',
			'',
			'We will decide the appeal by written representations (Part 1).',
			'',
			'There will be no local planning authority statement, interested party comments or final comments.',
			'',
			'You can tell us if you think a different procedure is more appropriate in the questionnaire.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'Start date: 01 January 2025',
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
			'# What happens next',
			'',
			'[Submit your questionnaire](/mock-front-office-url/manage-appeals/134526), including the appropriate appeal notification letter by 01 January 2025.',
			'',
			'You do not need to ask interested parties for comments when you notify them.',
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
				subject: 'New planning appeal: 134526'
			}
		);
	});
});
