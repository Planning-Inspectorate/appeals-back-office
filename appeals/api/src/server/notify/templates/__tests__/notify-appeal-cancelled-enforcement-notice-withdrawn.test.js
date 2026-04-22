import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-cancelled-enforcement-notice-withdrawn.content.md', () => {
	test('should call notify sendEmail with the correct data when event_type is set', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-cancelled-enforcement-notice-withdrawn',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				local_planning_authority: 'Bristol City Council',
				enforcement_reference: 'ENF/2025/123456',
				issue_date: '01 January 2025',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				event_type: 'site visit',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			}
		};

		const expectedContent = [
			'Bristol City Council has withdrawn the enforcement notice.',
			'',
			'The enforcement notice issued on 01 January 2025 will not take effect.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: ENF/2025/123456',
			'',
			'# What happens next',
			'',
			'We have closed the appeal and cancelled the site visit.',
			'',
			'If there are any costs applications, we will decide these separately.',
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
				subject: 'Enforcement notice withdrawn: 134526'
			}
		);
	});

	test('should call notify sendEmail with the correct data when event_type is not set', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-cancelled-enforcement-notice-withdrawn',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				local_planning_authority: 'Bristol City Council',
				enforcement_reference: 'ENF/2025/123456',
				issue_date: '01 January 2025',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				event_type: '',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			}
		};

		const expectedContent = [
			'Bristol City Council has withdrawn the enforcement notice.',
			'',
			'The enforcement notice issued on 01 January 2025 will not take effect.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: ENF/2025/123456',
			'',
			'# What happens next',
			'',
			'We have closed the appeal.',
			'',
			'If there are any costs applications, we will decide these separately.',
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
				subject: 'Enforcement notice withdrawn: 134526'
			}
		);
	});
});
