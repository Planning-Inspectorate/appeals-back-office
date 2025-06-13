import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-start-date-change-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-start-date-change-appellant',
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
				site_visit: true,
				costs_info: true
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# New start date for your appeal',
			'',
			'The start date of your appeal has changed. Your new start date is 01 January 2025.',
			'',
			'# Next steps',
			'',
			'We’ve asked Bristol City Council to complete a questionnaire about your appeal.',
			'',
			'We will arrange for an inspector to visit the address. You may need to attend the visit.',
			'',
			'# Costs information',
			'',
			'Withdrawing your appeal without good reason may result in a successful application for costs.',
			'',
			'Costs can also be awarded by an inspector.',
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
				subject: 'Your start date has changed: 134526'
			}
		);
	});

	test('should call notify sendEmail for a hearing appeal', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-start-date-change-appellant',
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
				site_visit: false,
				costs_info: false
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# New start date for your appeal',
			'',
			'The start date of your appeal has changed. Your new start date is 01 January 2025.',
			'',
			'# Next steps',
			'',
			'We’ve asked Bristol City Council to complete a questionnaire about your appeal.',
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
				subject: 'Your start date has changed: 134526'
			}
		);
	});
});
