import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-timetable-updated-hearing.content.md', () => {
	test('should render correct content with all optional dates', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-timetable-updated-hearing',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				lpa_questionnaire_due_date: '01 January 2025',
				lpa_statement_due_date: '10 January 2025',
				ip_comments_due_date: '20 January 2025',
				statement_of_common_ground_due_date: '01 May 2025',
				planning_obligation_due_date: '01 June 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We have updated your timetable.',
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
			'Due by 01 January 2025.',
			'',
			'## Statement from the local planning authority',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'Due by 20 January 2025.',
			'',
			'## Statement of common ground',
			'Due by 01 May 2025.',
			'',
			'## Planning obligation',
			'Due by 01 June 2025.',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'We have updated your timetable: 134526'
			}
		);
	});

	test('should render correct content without optional dates', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-timetable-updated-hearing',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				lpa_questionnaire_due_date: '01 January 2025',
				lpa_statement_due_date: '10 January 2025',
				ip_comments_due_date: '20 January 2025',
				statement_of_common_ground_due_date: '',
				planning_obligation_due_date: '',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We have updated your timetable.',
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
			'Due by 01 January 2025.',
			'',
			'## Statement from the local planning authority',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'Due by 20 January 2025.',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'We have updated your timetable: 134526'
			}
		);
	});
});
