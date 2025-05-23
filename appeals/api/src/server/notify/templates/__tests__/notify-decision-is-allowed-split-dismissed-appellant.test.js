import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';
import { householdAppeal } from '#tests/appeals/mocks.js';

describe('decision-is-allowed-split-dismissed-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'decision-is-allowed-split-dismissed-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: householdAppeal.appellant.email,
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				decision_date: '01 January 2021',
				front_office_url: '/mock-front-office-url'
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
			'We have made a decision on your appeal.',
			'',
			'[Sign in to our service](/mock-front-office-url/appeals/ABC45678) to view the decision letter dated 01 January 2021.',
			'',
			'We have also informed the local planning authority of the decision.',
			'',
			'# The Planning Inspectorate’s role',
			'',
			'The Planning Inspectorate cannot change or revoke the decision. You can [challenge the decision in the High Court](https://www.gov.uk/appeal-planning-decision/if-you-think-the-appeal-decision-is-legally-incorrect) if you think the Planning Inspectorate made a legal mistake.',
			'',
			'# Feedback',
			'',
			'We welcome your feedback on our appeals service. Tell us on this short [feedback form](https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u).',
			'',
			'The Planning Inspectorate',
			'[Get help with your appeal decision](https://contact-us.planninginspectorate.gov.uk/hc/en-gb/requests/new)'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			householdAppeal.appellant.email,
			{
				content: expectedContent,
				subject: 'Appeal decision: ABC45678'
			}
		);
	});
});
