import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('shared-cost-application-comment.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'shared-cost-application-comment',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@example.com',
			personalisation: {
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				lpa_reference: '48269/APP/2021/1482',
				front_office_url: '/mock-front-office-url',
				contact_email: 'appeals@planninginspectorate.gov.uk',
				deadline: '24 June 2026',
				dashboard_link: 'appeals'
			}
		};

		const expectedContent = [
			'We have received a new comment on the application for costs on appeal 134526.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# What happens next',
			'[View all comments in the appeals service.](/mock-front-office-url/appeals/134526)',
			'',
			'Planning Inspectorate',
			'',
			'appeals@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@example.com',
			{
				content: expectedContent,
				subject: 'New comment on the application for costs on an appeal 134526'
			}
		);
	});

	test('should ask for comments', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'shared-cost-application-comment',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@example.com',
			personalisation: {
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				lpa_reference: '48269/APP/2021/1482',
				front_office_url: '/mock-front-office-url',
				contact_email: 'appeals@planninginspectorate.gov.uk',
				deadline: '24 June 2026',
				dashboard_link: 'appeals',
				responses_invited: true
			}
		};

		const expectedContent = [
			'We have received a new comment on the application for costs on appeal 134526.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# What happens next',
			'[View all comments in the appeals service.](/mock-front-office-url/appeals/134526)',
			'',
			'Send an email to appeals@planninginspectorate.gov.uk by 24 June 2026 if you want to respond to this comment.',
			'Planning Inspectorate',
			'',
			'appeals@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@example.com',
			{
				content: expectedContent,
				subject: 'New comment on the application for costs on an appeal 134526'
			}
		);
	});
});
