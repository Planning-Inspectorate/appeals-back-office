import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appeal-confirmed-enforcement-lpa.md', () => {
	test('should call notify sendEmail with the correct data - multiple grounds, ground a barred, with other info and agent', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['b', 'c'],
				ground_a_barred: true,
				other_info: 'Accio horcrux',
				agent_contact_details: 'Agent Smith, agent.smith@matrix.com, 07000000123',
				appellant_contact_details: 'Thomas A Anderson, neo@matrix.com, 07000000456'
			}
		};

		const expectedContent = [
			'We have received an enforcement appeal.',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'- Ground (b)',
			'- Ground (c)',
			'',
			'You can [view the appeal in the manage your appeals service](/mock-front-office-url/manage-appeals/134526).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Agent: Agent Smith, agent.smith@matrix.com, 07000000123',
			'Appellant: Thomas A Anderson, neo@matrix.com, 07000000456',
			'',
			'# Ground (a) barred',
			'',
			'We cannot consider ground (a) because the enforcement notice was issued:',
			'- after the appellant made a related planning application',
			'- within 2 years from the date the application or appeal made stopped being considered',
			'',
			'The appeal does not meet the requirements for this ground from [section 174(2A to 2B) of the Town and Country Planning Act 1990](https://www.legislation.gov.uk/ukpga/1990/8/section/174).',
			'',
			'# Other information',
			'',
			'Accio horcrux',
			'',
			'# What happens next',
			'',
			'We will contact you when we start the appeal.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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
				subject: 'We have received an enforcement appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail with the correct data - ground a, not ground a barred, with other info and no agent', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['a'],
				ground_a_barred: false,
				other_info: 'Accio horcrux',
				agent_contact_details: '',
				appellant_contact_details: 'Thomas A Anderson, neo@matrix.com, 07000000456'
			}
		};

		const expectedContent = [
			'We have received an enforcement appeal.',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'Ground (a)',
			'',
			'You can [view the appeal in the manage your appeals service](/mock-front-office-url/manage-appeals/134526).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Appellant: Thomas A Anderson, neo@matrix.com, 07000000456',
			'',
			'# Other information',
			'',
			'Accio horcrux',
			'',
			'# What happens next',
			'',
			'We will contact you when we start the appeal.',
			'',
			'Send an email to caseofficers@planninginspectorate.gov.uk to confirm if the appellant has paid the correct fee on the enforcement notice.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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
				subject: 'We have received an enforcement appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail with the correct data - ground b, not ground a barred, no other info', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['b'],
				ground_a_barred: false,
				other_info: 'No',
				agent_contact_details: 'Agent Smith, agent.smith@matrix.com, 07000000123',
				appellant_contact_details: 'Thomas A Anderson, neo@matrix.com, 07000000456'
			}
		};

		const expectedContent = [
			'We have received an enforcement appeal.',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'Ground (b)',
			'',
			'You can [view the appeal in the manage your appeals service](/mock-front-office-url/manage-appeals/134526).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Agent: Agent Smith, agent.smith@matrix.com, 07000000123',
			'Appellant: Thomas A Anderson, neo@matrix.com, 07000000456',
			'',
			'# What happens next',
			'',
			'We will contact you when we start the appeal.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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
				subject: 'We have received an enforcement appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail with the correct data - ground c, not ground a barred, with other info', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['c'],
				ground_a_barred: false,
				other_info: 'Accio horcrux',
				agent_contact_details: 'Agent Smith, agent.smith@matrix.com, 07000000123',
				appellant_contact_details: 'Thomas A Anderson, neo@matrix.com, 07000000456'
			}
		};

		const expectedContent = [
			'We have received an enforcement appeal.',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'Ground (c)',
			'',
			'You can [view the appeal in the manage your appeals service](/mock-front-office-url/manage-appeals/134526).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Agent: Agent Smith, agent.smith@matrix.com, 07000000123',
			'Appellant: Thomas A Anderson, neo@matrix.com, 07000000456',
			'',
			'# Other information',
			'',
			'Accio horcrux',
			'',
			'# What happens next',
			'',
			'We will contact you when we start the appeal.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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
				subject: 'We have received an enforcement appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail with the correct data - multiple grounds, ground a barred, no other info', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['b', 'c'],
				ground_a_barred: true,
				other_info: 'No',
				agent_contact_details: 'Agent Smith, agent.smith@matrix.com, 07000000123',
				appellant_contact_details: 'Thomas A Anderson, neo@matrix.com, 07000000456'
			}
		};

		const expectedContent = [
			'We have received an enforcement appeal.',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'- Ground (b)',
			'- Ground (c)',
			'',
			'You can [view the appeal in the manage your appeals service](/mock-front-office-url/manage-appeals/134526).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Agent: Agent Smith, agent.smith@matrix.com, 07000000123',
			'Appellant: Thomas A Anderson, neo@matrix.com, 07000000456',
			'',
			'# Ground (a) barred',
			'',
			'We cannot consider ground (a) because the enforcement notice was issued:',
			'- after the appellant made a related planning application',
			'- within 2 years from the date the application or appeal made stopped being considered',
			'',
			'The appeal does not meet the requirements for this ground from [section 174(2A to 2B) of the Town and Country Planning Act 1990](https://www.legislation.gov.uk/ukpga/1990/8/section/174).',
			'',
			'# What happens next',
			'',
			'We will contact you when we start the appeal.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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
				subject: 'We have received an enforcement appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail with the correct data - multiple grounds, ground a barred, no other info, other appeals with grounds', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['b', 'c'],
				ground_a_barred: true,
				other_appeals_grounds_group: [
					{ reference: '100001', grounds: ['b'] },
					{ reference: '100002', grounds: ['c', 'd'] }
				],
				other_info: 'No',
				agent_contact_details: 'Agent Smith, agent.smith@matrix.com, 07000000123',
				appellant_contact_details: 'Thomas A Anderson, neo@matrix.com, 07000000456'
			}
		};

		const expectedContent = [
			'We have received an enforcement appeal.',
			'',
			'134526 will continue on the following grounds:',
			'',
			'- Ground (b)',
			'- Ground (c)',
			'',
			'100001 will continue on the following grounds:',
			'',
			'Ground (b)',
			'',
			'100002 will continue on the following grounds:',
			'',
			'- Ground (c)',
			'- Ground (d)',
			'',
			'You can [view the appeal in the manage your appeals service](/mock-front-office-url/manage-appeals/134526).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Agent: Agent Smith, agent.smith@matrix.com, 07000000123',
			'Appellant: Thomas A Anderson, neo@matrix.com, 07000000456',
			'',
			'# Ground (a) barred',
			'',
			'We cannot consider ground (a) because the enforcement notice was issued:',
			'- after the appellant made a related planning application',
			'- within 2 years from the date the application or appeal made stopped being considered',
			'',
			'The appeal does not meet the requirements for this ground from [section 174(2A to 2B) of the Town and Country Planning Act 1990](https://www.legislation.gov.uk/ukpga/1990/8/section/174).',
			'',
			'# What happens next',
			'',
			'We will contact you when we start the appeal.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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
				subject: 'We have received an enforcement appeal: 134526'
			}
		);
	});

	test('should call notify sendEmail with the correct data - multiple grounds, ground a barred, no other info, other_appeals_grounds_group empty array', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-enforcement-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk',
				local_planning_authority: 'Bristol City Council',
				appeal_type: 'Enforcement Notice',
				enforcement_reference: '12345/ENF/1234/1234',
				appeal_grounds: ['b', 'c'],
				ground_a_barred: true,
				other_appeals_grounds_group: [],
				other_info: 'No',
				agent_contact_details: 'Agent Smith, agent.smith@matrix.com, 07000000123',
				appellant_contact_details: 'Thomas A Anderson, neo@matrix.com, 07000000456'
			}
		};

		const expectedContent = [
			'We have received an enforcement appeal.',
			'',
			'The appeal will continue on the following grounds:',
			'',
			'- Ground (b)',
			'- Ground (c)',
			'',
			'You can [view the appeal in the manage your appeals service](/mock-front-office-url/manage-appeals/134526).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Enforcement notice reference: 12345/ENF/1234/1234',
			'Agent: Agent Smith, agent.smith@matrix.com, 07000000123',
			'Appellant: Thomas A Anderson, neo@matrix.com, 07000000456',
			'',
			'# Ground (a) barred',
			'',
			'We cannot consider ground (a) because the enforcement notice was issued:',
			'- after the appellant made a related planning application',
			'- within 2 years from the date the application or appeal made stopped being considered',
			'',
			'The appeal does not meet the requirements for this ground from [section 174(2A to 2B) of the Town and Country Planning Act 1990](https://www.legislation.gov.uk/ukpga/1990/8/section/174).',
			'',
			'# What happens next',
			'',
			'We will contact you when we start the appeal.',
			'',
			'[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).',
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
				subject: 'We have received an enforcement appeal: 134526'
			}
		);
	});
});
