import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('decision-is-invalid-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'decision-is-invalid-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				decision_date: '01 January 2021',
				reasons: ['Reason one', 'Reason two', 'Reason three']
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# Appeal decision',
			'',
			"We've decided that the appeal is invalid. We've closed the appeal.",
			'',
			'# Why the appeal is invalid',
			'',
			'- Reason one',
			'- Reason two',
			'- Reason three',
			'',
			'# The Planning Inspectorate’s role',
			'',
			'We consider all of the information submitted by all parties in the appeal, but only include key points in our decision.',
			'',
			'We cannot change or discuss the decision.',
			'',
			'# Feedback',
			'',
			'We welcome your feedback on our appeals service. Tell us on this short [feedback form](https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u).',
			'',
			'The Planning Inspectorate',
			'allcustomerteam@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Appeal invalid: ABC45678'
			}
		);
	});
});
