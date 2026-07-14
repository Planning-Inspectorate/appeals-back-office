import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';
import { APPEAL_APPEAL_UNDER_ACT_SECTION } from '@planning-inspectorate/data-model';

describe('appeal-confirmed-lpa.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appeal-confirmed-lpa',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_type: 'LDC appeal',
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				agent_contact_details: 'Agent Smith, agent.smith@matrix.com, 07000000123',
				appellant_contact_details: 'Thomas A Anderson, neo@matrix.com, 07000000456',
				ldc_type: APPEAL_APPEAL_UNDER_ACT_SECTION.EXISTING_DEVELOPMENT,
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			`You have a new ${notifySendData.personalisation.appeal_type.toLowerCase()} against the application ${notifySendData.personalisation.lpa_reference}`,
			'',
			`[You can view the appeal in the appeals service](/mock-front-office-url/manage-appeals/${notifySendData.personalisation.appeal_reference_number}).`,
			'',
			'# Appeal details',
			'',
			`^Appeal reference number: ${notifySendData.personalisation.appeal_reference_number}`,
			`Address: ${notifySendData.personalisation.site_address}`,
			`Reference number: ${notifySendData.personalisation.lpa_reference}`,
			`Agent: ${notifySendData.personalisation.agent_contact_details}`,
			`Appellant: ${notifySendData.personalisation.appellant_contact_details}`,
			`Lawful development certificate type: ${notifySendData.personalisation.ldc_type}`,
			'',
			'# What happens next',
			'We will contact you when we start the appeal.',
			'',
			`[Find out more about the lawful development certificate appeal process](https://www.gov.uk/government/publications/certificate-of-lawful-use-or-development-appeals-procedural-guide).`,
			'',
			'Planning Inspectorate',
			`${notifySendData.personalisation.team_email_address}`
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: `New ${notifySendData.personalisation.appeal_type.toLowerCase()} against the application ${notifySendData.personalisation.lpa_reference}`
			}
		);
	});
});
