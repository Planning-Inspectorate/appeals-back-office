import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('decision-is-invalid-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'decision-is-invalid-appellant',
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
			'We have reviewed your appeal and decided that it is invalid. We have contacted the local planning authority to tell them our decision.',
			'',
			'Your appeal is now closed.',
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
			'# If you think the appeal decision is legally incorrect',
			'',
			'You can challenge the decision in the [High Court](https://www.justice.gov.uk/courts/rcj-rolls-building/administrative-court) if you think the Planning Inspectorate made a legal mistake.',
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
				subject: 'Your appeal is invalid: ABC45678'
			}
		);
	});
});
