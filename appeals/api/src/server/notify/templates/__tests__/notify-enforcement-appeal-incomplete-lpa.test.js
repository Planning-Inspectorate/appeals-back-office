import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('enforcement-appeal-incomplete-lpa.md', () => {
	test('should call notify sendEmail with all missing info', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-appeal-incomplete-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				lpa_reference: '48269/APP/2021/1482',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				due_date: '14 July 2035',
				fee_due_date: '14 August 2035',
				reasons: [
					'The original application form is incomplete',
					'Other: Appellant contact information is incorrect or missing'
				],
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We have asked the appellant to submit missing information.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: ENF/1234/1234/1234',
			'',
			'# Missing information',
			'',
			'## Missing documents',
			'',
			'- Enforcement notice: reason 1',
			'- Planning obligation: reason 2',
			'',
			'## Pay the ground (a) fee',
			'',
			'## Other',
			'',
			'reason 3',
			'',
			'# What happens next',
			'',
			'The appellant needs to send the missing information to us by 14 July 2035 and pay the fee by 14 August 2035.',
			'',
			'Send an email to caseofficers@planninginspectorate.gov.uk to confirm when you receive the fee. Include the details of each appellant that pays the fee.',
			'',
			'If you do not receive the correct fee by 14 August 2035 we will close the appeal.',
			'',
			'Planning Inspectorate'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Missing information: 134526'
			}
		);
	});
});
