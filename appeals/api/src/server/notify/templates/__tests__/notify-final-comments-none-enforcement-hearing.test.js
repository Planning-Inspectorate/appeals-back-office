import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('final-comments-none-enforcement-hearing.content.md', () => {
	test('should render correct content with full hearing details', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'final-comments-none-enforcement-hearing',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				hearing_date: '01 January 2025',
				hearing_time: '10:00am',
				hearing_expected_days: '2',
				inspector: 'Mr Test Inspector',
				hearing_address: '123 Hearing Venue, Testtown, TE5 7ST',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'Neither the local planning authority or the appellant submitted any final comments.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# Hearing details',
			'',
			'^Date: 01 January 2025',
			'Time: 10:00am',
			'Expected days: 2',
			'Inspector: Mr Test Inspector',
			'Venue address: 123 Hearing Venue, Testtown, TE5 7ST',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
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
				subject: 'No final comments: 134526'
			}
		);
	});

	test('should render correct content when hearing is not yet set up', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'final-comments-none-enforcement-hearing',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				hearing_date: '',
				hearing_time: '',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'Neither the local planning authority or the appellant submitted any final comments.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'We will contact you by email when we set up the hearing.',
			'',
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
				subject: 'No final comments: 134526'
			}
		);
	});

	test('should render hearing details without optional fields', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'final-comments-none-enforcement-hearing',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				hearing_date: '01 January 2025',
				hearing_time: '10:00am',
				hearing_expected_days: '',
				inspector: '',
				hearing_address: '',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'Neither the local planning authority or the appellant submitted any final comments.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# Hearing details',
			'',
			'^Date: 01 January 2025',
			'Time: 10:00am',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
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
				subject: 'No final comments: 134526'
			}
		);
	});
});
