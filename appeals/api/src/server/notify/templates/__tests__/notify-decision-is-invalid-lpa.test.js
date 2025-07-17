// @ts-nocheck
import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('decision-is-invalid-lpa.md', () => {
	let notifySendData;
	let expectedContentA;
	let expectedContentB;

	beforeEach(() => {
		notifySendData = {
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

		expectedContentA = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# Appeal decision',
			'',
			'We have reviewed the appeal and decided that it is not valid. We have contacted the appellant to tell them our decision.',
			'',
			'The appeal is now closed.',
			'',
			'# Why the appeal is not valid',
			'',
			'- Reason one',
			'- Reason two',
			'- Reason three',
			''
		];

		expectedContentB = [
			'# Feedback',
			'',
			'This is a new service. Help us improve it and [give your feedback (opens in new tab)](https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u).',
			'',
			'The Planning Inspectorate',
			'allcustomerteam@planninginspectorate.gov.uk'
		];
	});

	test('should call notify sendEmail with the correct data when there are cost decisions', async () => {
		notifySendData.personalisation.has_costs_decision = true;
		const expectedContent = [
			...expectedContentA,
			'# Costs decision',
			'',
			'[Sign in to our service](/mock-front-office-url/manage-appeals/ABC45678) to view the costs decision.',
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
});
