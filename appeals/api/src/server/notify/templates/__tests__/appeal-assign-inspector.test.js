import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-unassign-inspector.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-assign-inspector',
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
				questionnaire_due_date: '01 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				inspector_name: 'Tom Michael'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			team_email_address: 'caseofficers@planninginspectorate.gov.uk'
		};

		const expectedContent = [
			'We have added the inspector Tom Michael to the appeal.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
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
				subject: 'Inspector added: 134526'
			}
		);
	});
});
