import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('decision-is-allowed-split-dismissed-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'decision-is-allowed-split-dismissed-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				decision_date: '01 January 2021'
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
			'A decision has been made on this appeal.',
			'',
			'[Sign in to our service](<https://appeals-service-test.planninginspectorate.gov.uk/manage-appeals/ABC45678>) to view the decision letter dated 01 January 2021.',
			'',
			'The appellant has been informed of the decision.',
			'',
			'# The Planning Inspectorate’s role',
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
				subject: 'Appeal decision: ABC45678'
			}
		);
	});
});
