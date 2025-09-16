import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('appellant-costs-decision-appellant.md', () => {
	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'appellant-costs-decision-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				lpa_reference: '48269/APP/2021/1482',
				appeal_reference_number: '134526',
				site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
				front_office_url: '/mock-front-office-url'
			}
		};

		const expectedContent = [
			'We have made a decision on your application for an award of appeal costs.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: 134526',
			'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			'Planning application reference: 48269/APP/2021/1482',
			'',
			'# Appeal costs decision',
			'',
			'[Sign in to our service](/mock-front-office-url/appeals/134526/appeal-details) to view the decision.',
			'',
			'We have also informed the local planning authority of the decision.',
			'',
			'# Feedback',
			'',
			'We welcome your feedback on our appeals service. Tell us on this short [feedback form](https://mcas-proxyweb.mcas.ms/certificate-checker?login=false&originalUrl=https%3A%2F%2Fforms.office.com.mcas.ms%2Fpages%2Fresponsepage.aspx%3Fid%3DmN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u%26McasTsid%3D20596&McasCSRF=06374e6dbbae2e7c7f24c4fc332cd4cbc0b467358e647ded92d4f539754b8ff7).',
			'',
			'The Planning Inspectorate  ',
			'enquiries@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Appeal costs decision: 134526'
			}
		);
	});
});
