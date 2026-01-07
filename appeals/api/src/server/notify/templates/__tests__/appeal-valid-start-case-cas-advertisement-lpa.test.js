import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-valid-start-case-cas-advertisement-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-cas-advertisement-lpa',
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
			'You have a new Householder appeal against the application 48269/APP/2021/1482.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'Start date: 01 January 2025',
			'',
			'# Next steps',
			'',
			'Email a copy of your appeal statement to caseofficers@planninginspectorate.gov.uk by 31 January 2025. You will be able to view this in your appeal details.',
			'',
			'We will email you when you can view information from other parties in the appeals service.',
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
