import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-timetable-updated-enforcement-hearing.content.md', () => {
	const basePersonalisation = {
		appeal_reference_number: '134526',
		lpa_reference: '48269/APP/2021/1482',
		site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
		lpa_questionnaire_due_date: '01 January 2025',
		lpa_statement_due_date: '10 January 2025',
		ip_comments_due_date: '20 January 2025',
		team_email_address: 'caseofficers@planninginspectorate.gov.uk'
	};

	test('should render all conditional sections when all optional values are present', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-timetable-updated-enforcement-hearing',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				...basePersonalisation,
				appellant: true,
				planning_obligation_due_date: '23 January 2025',
				final_comments_due_date: '24 January 2025',
				statement_of_common_ground_due_date: '25 January 2025',
				proof_of_evidence_and_witnesses_due_date: '26 January 2025'
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
			'## Statements',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'Due by 20 January 2025.',
			'',
			'## Planning obligation',
			'Send to caseofficers@planninginspectorate.gov.uk by 23 January 2025.',
			'',
			'## Final comments',
			'Due by 24 January 2025.',
			'',
			'## Statement of common ground',
			'Send to caseofficers@planninginspectorate.gov.uk by 25 January 2025.',
			'',
			'## Proof of evidence and witnesses',
			'Due by 26 January 2025.',
			'',
			'Planning Inspectorate',
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

	test('should not render planning obligation when appellant is not set', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-timetable-updated-enforcement-hearing',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				...basePersonalisation,
				planning_obligation_due_date: '23 January 2025',
				final_comments_due_date: '',
				statement_of_common_ground_due_date: '',
				proof_of_evidence_and_witnesses_due_date: ''
			}
		};

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			'test@136s7.com',
			expect.objectContaining({
				subject: 'We have updated your timetable: 134526',
				content: expect.not.stringContaining('## Planning obligation')
			})
		);
	});

	test('should render only required sections when optional values are empty', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-timetable-updated-enforcement-hearing',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				...basePersonalisation,
				appellant: true,
				planning_obligation_due_date: '',
				final_comments_due_date: '',
				statement_of_common_ground_due_date: '',
				proof_of_evidence_and_witnesses_due_date: ''
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
			'## Statements',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'Due by 20 January 2025.',
			'',
			'Planning Inspectorate',
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

	test('should render enforcement notice reference text and only required sections when optional values are empty and we have enforcement ref', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-timetable-updated-enforcement-hearing',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				...basePersonalisation,
				appellant: true,
				enforcement_reference: 'ENF123456',
				planning_obligation_due_date: '',
				final_comments_due_date: '',
				statement_of_common_ground_due_date: '',
				proof_of_evidence_and_witnesses_due_date: ''
			}
		};

		const expectedContent = [
			'We have updated your timetable.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: ENF123456',
			'',
			'# Timetable',
			'',
			'## Local planning authority questionnaire',
			'Due by 01 January 2025.',
			'',
			'## Statements',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'Due by 20 January 2025.',
			'',
			'Planning Inspectorate',
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
