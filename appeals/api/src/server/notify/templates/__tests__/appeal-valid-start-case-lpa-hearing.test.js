import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-valid-start-case-lpa-hearing.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-valid-start-case-lpa-hearing',
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
				questionnaire_due_date: '01 January 2025',
				lpa_statement_due_date: '01 February 2025',
				ip_comments_due_date: '01 March 2025',
				statement_of_common_ground_due_date: '01 April 2025',
				planning_obligation_due_date: '01 May 2025',
				hearing_date: '01 April 2025',
				hearing_time: '1pm'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'You have a new Householder appeal against the application 48269/APP/2021/1482.',
			'',
			'We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
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
			'Due by 01 January 2025.',
			'',
			'## Statement from the local planning authority',
			'Due by 01 February 2025.',
			'',
			'## Interested party comments',
			'Due by 01 March 2025.',
			'',
			'## Statement of common ground',
			'Due by 01 April 2025.',
			'',
			'# Hearing details',
			'',
			'^Date: 01 April 2025',
			'Time: 1pm',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'# What happens next',
			'',
			'1. [Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'2. Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the hearing.',
			'',
			'The Planning Inspectorate'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'New Householder appeal: 134526'
			}
		);
	});
});
