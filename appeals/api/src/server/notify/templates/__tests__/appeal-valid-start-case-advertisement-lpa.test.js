import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-valid-start-case-advertisement-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-advertisement-lpa',
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
			startDate: new Date('2025-01-01'),
			team_email_address: 'caseofficers@planninginspectorate.gov.uk'
		};

		const expectedContent = [
			'You have a new householder appeal against the application 48269/APP/2021/1482.',
			'',
			'We will decide the appeal by a written procedure. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
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
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 31 January 2025.',
			'',
			'The appellant will send us their appeal statement by 01 March 2025.',
			'',
			'[Find out your responsibilities in the appeal process](http://www.gov.uk/government/publications/planning-appeals-procedural-guide/procedural-guide-planning-appeals-england).',
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
				subject: 'New Householder: 134526'
			}
		);
	});
});
