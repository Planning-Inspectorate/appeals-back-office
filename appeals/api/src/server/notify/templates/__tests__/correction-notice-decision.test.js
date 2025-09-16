import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('correction-notice-decision.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'correction-notice-decision',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				start_date: '01 January 2025',
				existing_appeal_type: 'Householder',
				correction_notice_reason: 'There has been a mistake - but we fixed it thanks',
				decision_date: '01 January 2025'
			},
			appeal: {
				id: 'mock-appeal-generic-id',
				reference: '134526'
			},
			startDate: new Date('2025-01-01')
		};

		const expectedContent = [
			'We have corrected the appeal decision letter.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# Why we corrected the appeal decision letter',
			'',
			'There has been a mistake - but we fixed it thanks',
			'',
			'[Sign in to our service](/mock-front-office-url/manage-appeals/134526) to view the decision letter dated 01 January 2025.',
			'',
			"# The Planning Inspectorate's role",
			'',
			'The Planning Inspectorate cannot change or revoke the decision. Only the High Court can change this decision.',
			'',
			'# Feedback',
			'',
			'We welcome your feedback on our appeals service. Tell us on this short [feedback form](https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u).',
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
				subject: 'We have corrected the appeal decision letter: 134526'
			}
		);
	});
});
