import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('enforcement-cancel-appeal-no-fee-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-cancel-appeal-no-fee-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				enforcement_reference: 'Reference',
				due_date: '1 May 2025',
				issue_date: '1 July 2024'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'You did not pay the ground (a) fee by 1 May 2025. We have cancelled your appeal.',
			'',
			'The enforcement notice issued on 1 July 2024 now takes effect.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: Reference',
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
				subject: 'Appeal cancelled: 134526'
			}
		);
	});
});
