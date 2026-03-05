// @ts-nocheck
import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('link-appeal-additional-appellants.md', () => {
	let notifySendData;

	beforeEach(() => {
		notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'link-appeal-additional-appellants',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: '134526',
				site_address: '88, Inspector Rise',
				enforcement_reference: '123456',
				lead_appeal_reference_number: '134526',
				one_additional_appellant: true,
				full_name_lead_appellant: 'Mr Lead Appellant',
				child_appeal_reference_number: '456789',
				full_name_additional_appellant: 'Ms Additional Appellant'
			}
		};
	});

	test('should call notify sendEmail with the correct data when there is only one additional appellant', async () => {
		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 88, Inspector Rise',
			'Enforcement notice reference: 123456',
			'',
			'We have linked the lead appeal 134526 to the appeal 456789.',
			'',
			'The lead appeal 134526 is for Mr Lead Appellant. We have created a linked appeal 456789 for Ms Additional Appellant and linked it to the lead appeal.',
			'',
			'The linked appeal will use the timetable for the lead appeal 134526.',
			'',
			'Planning Inspectorate',
			'ECAT@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'We have linked the enforcement appeal: 134526'
			}
		);
	});
	test('should call notify sendEmail with the correct data when there are more than one additional appellants', async () => {
		notifySendData.personalisation = {
			...notifySendData.personalisation,
			one_additional_appellant: false,
			child_appeal_reference_number: ['456789', '787896'],
			full_name_additional_appellant: ['Ms Additional Appellant', 'Dr Extra Appellant']
		};
		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 88, Inspector Rise',
			'Enforcement notice reference: 123456',
			'',
			'The lead appeal 134526 is for Mr Lead Appellant. We have created a linked appeal for each additional appellant and have linked them to the lead appeal.',
			'',
			'# Linked appeals',
			'',
			'__456789__',
			'Ms Additional Appellant',
			'',
			'__787896__',
			'Dr Extra Appellant',
			'',
			'All of the linked appeals will use the timetable for the lead appeal 134526.',
			'',
			'Planning Inspectorate',
			'ECAT@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'We have linked the enforcement appeal: 134526'
			}
		);
	});
});
