import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-confirmed-enforcement-appellant.md', () => {
	test('should call notify sendEmail with the correct data - multiple grounds, ground a barred, with other info', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				feedback_link: 'https://forms.office.com/r/9U4Sq9rEff',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['b', 'c'],
				ground_a_barred: true,
				other_info: 'Accio horcrux'
			}
		};

		const expectedContent = [
			'We have confirmed your appeal and you have submitted all of the information we need.',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'- Ground (b)',
			'- Ground (c)',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'',
			'# Ground (a) barred',
			'',
			'We cannot consider ground (a) because the enforcement notice was issued:',
			'- after you made a related planning application',
			'- within 2 years from the date the application or appeal made stopped being considered',
			'',
			'Your appeal does not meet the requirements for this ground from [section 174(2A to 2B) of the Town and Country Planning Act 1990](https://www.legislation.gov.uk/ukpga/1990/8/section/174).',
			'',
			'# Other information',
			'',
			'Accio horcrux',
			'',
			'# What happens next',
			'',
			'1. Download a copy of your appeal form.',
			'2. [Find the email address for your local planning authority](https://www.gov.uk/government/publications/sending-a-copy-of-the-appeal-form-to-the-council/sending-a-copy-to-the-council).',
			'3. Email the copy of your appeal form and the documents you uploaded to: Bristol City Council.',
			'',
			'You must send a copy of your appeal form and documents to the local planning authority, it’s a legal requirement.',
			'',
			'[Find out about the enforcement appeals process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Give feedback',
			'',
			'[Give feedback on the appeals service](https://forms.office.com/r/9U4Sq9rEff) (takes 2 minutes)',
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
				subject: 'We have confirmed your appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail with the correct data - single grounds, not ground a barred, no other info', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				feedback_link: 'https://forms.office.com/r/9U4Sq9rEff',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				ground_a_barred: false,
				other_info: 'No'
			}
		};

		const expectedContent = [
			'We have confirmed your appeal and you have submitted all of the information we need.',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'Ground (a)',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'',
			'# What happens next',
			'',
			'1. Download a copy of your appeal form.',
			'2. [Find the email address for your local planning authority](https://www.gov.uk/government/publications/sending-a-copy-of-the-appeal-form-to-the-council/sending-a-copy-to-the-council).',
			'3. Email the copy of your appeal form and the documents you uploaded to: Bristol City Council.',
			'',
			'You must send a copy of your appeal form and documents to the local planning authority, it’s a legal requirement.',
			'',
			'[Find out about the enforcement appeals process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Give feedback',
			'',
			'[Give feedback on the appeals service](https://forms.office.com/r/9U4Sq9rEff) (takes 2 minutes)',
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
				subject: 'We have confirmed your appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail with the correct data - single grounds, not ground a barred, with other info', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				feedback_link: 'https://forms.office.com/r/9U4Sq9rEff',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				ground_a_barred: false,
				other_info: 'Accio horcrux'
			}
		};

		const expectedContent = [
			'We have confirmed your appeal and you have submitted all of the information we need.',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'Ground (a)',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'',
			'# Other information',
			'',
			'Accio horcrux',
			'',
			'# What happens next',
			'',
			'1. Download a copy of your appeal form.',
			'2. [Find the email address for your local planning authority](https://www.gov.uk/government/publications/sending-a-copy-of-the-appeal-form-to-the-council/sending-a-copy-to-the-council).',
			'3. Email the copy of your appeal form and the documents you uploaded to: Bristol City Council.',
			'',
			'You must send a copy of your appeal form and documents to the local planning authority, it’s a legal requirement.',
			'',
			'[Find out about the enforcement appeals process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Give feedback',
			'',
			'[Give feedback on the appeals service](https://forms.office.com/r/9U4Sq9rEff) (takes 2 minutes)',
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
				subject: 'We have confirmed your appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail with the correct data - multiple grounds, ground a barred, no other info', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				feedback_link: 'https://forms.office.com/r/9U4Sq9rEff',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['b', 'c'],
				ground_a_barred: true,
				other_info: 'No'
			}
		};

		const expectedContent = [
			'We have confirmed your appeal and you have submitted all of the information we need.',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'- Ground (b)',
			'- Ground (c)',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'',
			'# Ground (a) barred',
			'',
			'We cannot consider ground (a) because the enforcement notice was issued:',
			'- after you made a related planning application',
			'- within 2 years from the date the application or appeal made stopped being considered',
			'',
			'Your appeal does not meet the requirements for this ground from [section 174(2A to 2B) of the Town and Country Planning Act 1990](https://www.legislation.gov.uk/ukpga/1990/8/section/174).',
			'',
			'# What happens next',
			'',
			'1. Download a copy of your appeal form.',
			'2. [Find the email address for your local planning authority](https://www.gov.uk/government/publications/sending-a-copy-of-the-appeal-form-to-the-council/sending-a-copy-to-the-council).',
			'3. Email the copy of your appeal form and the documents you uploaded to: Bristol City Council.',
			'',
			'You must send a copy of your appeal form and documents to the local planning authority, it’s a legal requirement.',
			'',
			'[Find out about the enforcement appeals process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
			'',
			'# Give feedback',
			'',
			'[Give feedback on the appeals service](https://forms.office.com/r/9U4Sq9rEff) (takes 2 minutes)',
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
				subject: 'We have confirmed your appeal: 134526'
			}
		);
	});
});
