import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('inquiry-set-up.content.md', () => {
	test('should call notify sendEmail with the correct data when is LPA', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'start-case-inquiry-set-up',
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
				procedure_type: 'written representations',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				inquiry_date: '1 January 2999',
				inquiry_time: '1:00pm',
				inquiry_address:
					'Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom',
				statement_of_common_ground_deadline: '24 January 2025',
				planning_obligation_deadline: '23 January 2025',
				proof_of_evidence_and_witnesses_deadline: '26 January 2025',
				is_lpa: true,
				inquiry_expected_days: '5'
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
			'We will decide the appeal by inquiry. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
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
			'## Statements from the local planning authority and any Rule 6 groups',
			'',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 20 January 2025.',
			'',
			'## Statement of common ground',
			'',
			'Due by 24 January 2025.',
			'',
			'## Proof of evidence and witnesses',
			'',
			'Due by 26 January 2025.',
			'',
			'## Planning obligation',
			'',
			'Due by 23 January 2025.',
			'',
			'# Inquiry details',
			'',
			'^Date: 1 January 2999',
			'Time: 1:00pm',
			'Expected days: 5',
			'Venue address: Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom',
			'',
			'The details of the inquiry are subject to change. We will contact you:',
			'',
			'- if we make any changes to the inquiry',
			'- when we set up the case management conference',
			'',
			'# What happens next',
			'',
			'[Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
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

	test('should call notify sendEmail with the correct data when is LPA and no inquiry address', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'start-case-inquiry-set-up',
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
				procedure_type: 'written representations',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				inquiry_date: '1 January 2999',
				inquiry_time: '1:00pm',
				inquiry_address: '',
				statement_of_common_ground_deadline: '24 January 2025',
				planning_obligation_deadline: '23 January 2025',
				proof_of_evidence_and_witnesses_deadline: '26 January 2025',
				is_lpa: true,
				inquiry_expected_days: '5'
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
			'We will decide the appeal by inquiry. You can tell us if you think a different procedure is more appropriate in the questionnaire.',
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
			'## Statements from the local planning authority and any Rule 6 groups',
			'',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 20 January 2025.',
			'',
			'## Statement of common ground',
			'',
			'Due by 24 January 2025.',
			'',
			'## Proof of evidence and witnesses',
			'',
			'Due by 26 January 2025.',
			'',
			'## Planning obligation',
			'',
			'Due by 23 January 2025.',
			'',
			'# Inquiry details',
			'',
			'^Date: 1 January 2999',
			'Time: 1:00pm',
			'Expected days: 5',
			'',
			'The details of the inquiry are subject to change. We will contact you:',
			'',
			'- if we make any changes to the inquiry',
			'- when we set up the case management conference',
			'',
			'# What happens next',
			'',
			'1. [Submit your questionnaire and other documents](/mock-front-office-url/manage-appeals/134526), including your appeal notification letter and a list of those notified by 01 January 2025.',
			'',
			'2. Email caseofficers@planninginspectorate.gov.uk to confirm the venue address for the inquiry.',
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

	test('should call notify sendEmail with the correct data when is not LPA', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'start-case-inquiry-set-up',
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
				procedure_type: 'written representations',
				questionnaire_due_date: '01 January 2025',
				lpa_statement_deadline: '10 January 2025',
				ip_comments_deadline: '20 January 2025',
				final_comments_deadline: '30 January 2025',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				inquiry_date: '1 January 2999',
				inquiry_time: '1:00pm',
				inquiry_address:
					'Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom',
				statement_of_common_ground_deadline: '24 January 2025',
				planning_obligation_deadline: '23 January 2025',
				proof_of_evidence_and_witnesses_deadline: '26 January 2025',
				is_lpa: false,
				inquiry_expected_days: '5'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'We have set up your timetable.',
			'',
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
			'',
			'Due by 01 January 2025.',
			'',
			'## Statements from the local planning authority and any Rule 6 groups',
			'',
			'Due by 10 January 2025.',
			'',
			'## Interested party comments',
			'',
			'Due by 20 January 2025.',
			'',
			'## Statement of common ground',
			'',
			'Due by 24 January 2025.',
			'',
			'## Proof of evidence and witnesses',
			'',
			'Due by 26 January 2025.',
			'',
			'## Planning obligation',
			'',
			'Due by 23 January 2025.',
			'',
			'# Inquiry details',
			'',
			'^Date: 1 January 2999',
			'Time: 1:00pm',
			'Expected days: 5',
			'Venue address: Court 2, 24 Court Street, Test Town, Test County, AB12 3CD, United Kingdom',
			'',
			'The details of the inquiry are subject to change. We will contact you:',
			'',
			'- if we make any changes to the inquiry',
			'- when we set up the case management conference',
			'',
			'# What happens next',
			'',
			'We will let you know when you can:',
			'',
			'- view information from other parties in the appeals service',
			'- submit your proof of evidence and witnesses',
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
				subject: 'We have set up your timetable: 134526'
			}
		);
	});
});
