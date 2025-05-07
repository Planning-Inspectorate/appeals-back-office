import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('site-visit-change-unaccompanied-to-access-required-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'site-visit-change-unaccompanied-to-access-required-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'appellant@example.com',
			personalisation: {
				appeal_reference_number: 'TUV44556',
				site_address: '5, Meadow Way',
				lpa_reference: 'REF-20201',
				visit_date: '27 September 2025',
				start_time: '9:00am',
				end_time: '11:00am'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: TUV44556',
			'Address: 5, Meadow Way',
			'Planning application reference: REF-20201',
			'',
			'# The site visit has changed',
			'',
			'We now require you, or someone else, to attend the site visit to provide access for our inspector.',
			'',
			'# Visit details',
			'',
			'Our inspector (or their representative) will visit 5, Meadow Way between 9:00am and 11:00am on 27 September 2025.',
			'',
			'Alternatively, and only if it is possible at the site, you can provide written consent for access for our inspector at planningcaseofficerscbos@planninginspectorate.gov.uk. Include our appeal reference number in any communication.',
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
				subject: 'Change to inspector visit to appeal site: TUV44556'
			}
		);
	});
});
