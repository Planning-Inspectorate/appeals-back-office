// @ts-nocheck
import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('decision-is-invalid-interested-party.md', () => {
	let notifySendData;
	let expectedContentA;
	let expectedContentB;

	beforeEach(() => {
		notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'decision-is-invalid-interested-party',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				decision_date: '01 January 2021',
				reasons: ['Reason one', 'Reason two', 'Reason three'],
				front_office_url: '/mock-front-office-url',
				feedback_link: '/mock-feedback-link',
				case_team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		expectedContentA = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# Appeal decision',
			'',
			'We have reviewed this appeal and decided that it is not valid.',
			'',
			'Appeal ABC45678 is now closed.',
			'',
			'We have informed the appellant and local planning authority about the decision.',
			'',
			'# Why the appeal is not valid',
			'',
			'',
			'',
			'- Reason one',
			'',
			'- Reason two',
			'',
			'- Reason three',
			'  ',
			''
		];

		expectedContentB = [
			'# Feedback',
			'',
			'This is a new service. Help us improve it and [give your feedback (opens in new tab)](/mock-feedback-link).',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		];
	});

	test('should call notify sendEmail with the correct data when there are cost decisions', async () => {
		notifySendData.personalisation.has_costs_decision = true;
		const expectedContent = [
			...expectedContentA,
			'# Costs decision',
			'',
			'[Access our service](/mock-front-office-url/comment-planning-appeal/appeals/ABC45678) to view the costs decision.',
			'',
			'',
			...expectedContentB
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

	test('should call notify sendEmail with the correct data when there are no cost decisions', async () => {
		notifySendData.personalisation.has_costs_decision = false;
		const expectedContent = [...expectedContentA, ...expectedContentB].join('\n');

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

	test('should not include reasons when there are no reasons', async () => {
		notifySendData.personalisation.reasons = [];
		notifySendData.personalisation.has_costs_decision = false;

		await notifySend(notifySendData);

		const sentContent = notifySendData.notifyClient.sendEmail.mock.calls[0][2].content;

		expect(sentContent).toContain('# Why the appeal is not valid');
		expect(sentContent).not.toContain('\n- ');
	});
});
