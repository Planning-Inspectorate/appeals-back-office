import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('enforcement-appeal-incomplete-appellant.md', () => {
	test('should call notify sendEmail with all missing info', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-appeal-incomplete-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				enforcement_reference: 'ENF/1234/1234/1234',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				local_planning_authority: 'Maidstone Borough Council',
				due_date: '14 July 2035',
				fee_due_date: '14 August 2035',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				missing_documents: ['Enforcement notice: reason 1', 'Planning obligation: reason 2'],
				other_info: 'reason 3',
				appeal_grounds: ['a', 'b']
			}
		};

		const expectedContent = [
			'We have received your appeal and we need more information.',
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
			'You need to pay the correct fee to Maidstone Borough Council, then email your receipt to caseofficers@planninginspectorate.gov.uk by 14 August 2035.',
			'',
			'## Other',
			'',
			'reason 3',
			'',
			'# What happens next',
			'',
			'You need to send the missing information to caseofficers@planninginspectorate.gov.uk by 14 July 2035 and pay the correct fee by 14 August 2035.',
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
				subject: 'We need more information: 134526'
			}
		);
	});

	test('should call notify sendEmail with only ground a fee payable', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-appeal-incomplete-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				enforcement_reference: 'ENF/1234/1234/1234',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				local_planning_authority: 'Maidstone Borough Council',
				due_date: '14 July 2035',
				fee_due_date: '14 August 2035',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				missing_documents: [],
				other_info: '',
				appeal_grounds: ['a', 'b']
			}
		};

		const expectedContent = [
			'We have received your appeal and we need more information.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: ENF/1234/1234/1234',
			'',
			'# Missing information',
			'',
			'## Pay the ground (a) fee',
			'',
			'You need to pay the correct fee to Maidstone Borough Council, then email your receipt to caseofficers@planninginspectorate.gov.uk by 14 August 2035.',
			'',
			'# What happens next',
			'',
			'You need to pay the correct fee to Maidstone Borough Council, then email your receipt to caseofficers@planninginspectorate.gov.uk by 14 August 2035.',
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
				subject: 'We need more information: 134526'
			}
		);
	});

	test('should call notify sendEmail with only missing docs', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-appeal-incomplete-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				enforcement_reference: 'ENF/1234/1234/1234',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				local_planning_authority: 'Maidstone Borough Council',
				due_date: '14 July 2035',
				fee_due_date: '',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				missing_documents: ['Enforcement notice: reason 1', 'Planning obligation: reason 2'],
				other_info: '',
				appeal_grounds: ['a', 'b']
			}
		};

		const expectedContent = [
			'We have received your appeal and we need more information.',
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
			'# What happens next',
			'',
			'You need to send the missing information to caseofficers@planninginspectorate.gov.uk by 14 July 2035.',
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
				subject: 'We need more information: 134526'
			}
		);
	});
});
