import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('enforcement-notice-invalid-lpa.md', () => {
	test('should call notify sendEmail with all reasons selected', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-notice-invalid-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				enforcement_reference: 'ENF/1234/1234/1234',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				reason_1: 'reason 1',
				reason_2: 'reason 2',
				reason_3: 'reason 3',
				reason_4: 'reason 4',
				reason_5: 'reason 5',
				reason_6: 'reason 6',
				reason_7: 'reason 7',
				reason_8: 'reason 8',
				other_info: 'Other information',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We have reviewed the enforcement notice and it is not valid.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: ENF/1234/1234/1234',
			'',
			'# Reasons the enforcement notice is invalid',
			'',
			'## It does not specify the boundaries of land',
			'',
			'reason 1',
			'',
			'## It states that the recipient needs to immediately stop enforcement activity',
			'',
			'reason 2',
			'',
			'## There is a mistake in the wording',
			'',
			'reason 3',
			'',
			'## No time between the effective date and the end of the compliance period',
			'',
			'reason 4',
			'',
			'## It does not specify a period for compliance (only a description)',
			'',
			'reason 5',
			'',
			'## It does not specify a period for compliance (completely missing)',
			'',
			'reason 6',
			'',
			'## The period for compliance is not clear',
			'',
			'reason 7',
			'',
			'## Other',
			'',
			'reason 8',
			'',
			'# Other information',
			'',
			'Other information',
			'',
			'# What happens next',
			'',
			'We have closed the appeal. The enforcement notice will not take effect.',
			'',
			'You should seek legal advice if you want to challenge this decision.',
			'',
			'(Find out more about the enforcement appeal process)[https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide].',
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
				subject: 'Enforcement notice invalid: 134526'
			}
		);
	});

	test('should call notify sendEmail with only some reasons selected', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-notice-invalid-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				enforcement_reference: 'ENF/1234/1234/1234',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				reason_2: 'reason 2',
				reason_3: 'reason 3',
				reason_5: 'reason 5',
				reason_7: 'reason 7',
				other_info: 'Other information',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We have reviewed the enforcement notice and it is not valid.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: ENF/1234/1234/1234',
			'',
			'# Reasons the enforcement notice is invalid',
			'',
			'## It states that the recipient needs to immediately stop enforcement activity',
			'',
			'reason 2',
			'',
			'## There is a mistake in the wording',
			'',
			'reason 3',
			'',
			'## It does not specify a period for compliance (only a description)',
			'',
			'reason 5',
			'',
			'## The period for compliance is not clear',
			'',
			'reason 7',
			'',
			'# Other information',
			'',
			'Other information',
			'',
			'# What happens next',
			'',
			'We have closed the appeal. The enforcement notice will not take effect.',
			'',
			'You should seek legal advice if you want to challenge this decision.',
			'',
			'(Find out more about the enforcement appeal process)[https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide].',
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
				subject: 'Enforcement notice invalid: 134526'
			}
		);
	});

	test('should call notify sendEmail with only some reasons selected and no other info', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-notice-invalid-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				enforcement_reference: 'ENF/1234/1234/1234',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				reason_1: 'reason 1',
				reason_2: 'reason 2',
				reason_5: 'reason 5',
				reason_8: 'reason 8',
				other_info: '',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We have reviewed the enforcement notice and it is not valid.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: ENF/1234/1234/1234',
			'',
			'# Reasons the enforcement notice is invalid',
			'',
			'## It does not specify the boundaries of land',
			'',
			'reason 1',
			'',
			'## It states that the recipient needs to immediately stop enforcement activity',
			'',
			'reason 2',
			'',
			'## It does not specify a period for compliance (only a description)',
			'',
			'reason 5',
			'',
			'## Other',
			'',
			'reason 8',
			'',
			'# What happens next',
			'',
			'We have closed the appeal. The enforcement notice will not take effect.',
			'',
			'You should seek legal advice if you want to challenge this decision.',
			'',
			'(Find out more about the enforcement appeal process)[https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide].',
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
				subject: 'Enforcement notice invalid: 134526'
			}
		);
	});
});
