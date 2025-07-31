import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-accompanied-to-access-required-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-accompanied-to-access-required-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'appellant@example.com',
			personalisation: {
				appeal_reference_number: 'GHI45678',
				site_address: '101, Example View',
				lpa_reference: 'APP-20256',
				visit_date: '10 September 2025',
				start_time: '8:00am',
				end_time: '12:00pm'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: GHI45678',
			'Address: 101, Example View',
			'Planning application reference: APP-20256',
			'',
			'# The site visit has changed',
			'',
			'We now require you, or someone else, to attend the site visit to provide access for our inspector.',
			'',
			'# Visit details',
			'',
			'Our inspector (or their representative) will visit 101, Example View between 8:00am and 12:00pm on 10 September 2025.',
			'',
			'Alternatively, and only if it is possible at the site, you can provide written consent for access for our inspector at caseofficers@planninginspectorate.gov.uk. Include our appeal reference number in any communication.',
			'',
			'# About the visit',
			'',
			'You cannot give the inspector any documents or discuss the appeal with them.',
			'',
			'The inspector will carry out the inspection on their own.',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'appellant@example.com',
			{
				content: expectedContent,
				subject: 'Change to inspector visit to appeal site: GHI45678'
			}
		);
	});
});
