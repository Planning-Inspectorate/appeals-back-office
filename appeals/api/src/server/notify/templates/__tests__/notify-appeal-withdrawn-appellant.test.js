import { jest } from '@jest/globals';
import { notifySend } from '#notify/notify-send.js';

test('should call notify sendEmail for appeal-withdrawn-appellant with the correct data', async () => {
	const notifySendData = {
		doNotMockNotifySend: true,
		templateName: 'appeal-withdrawn-appellant',
		notifyClient: {
			sendEmail: jest.fn()
		},
		recipientEmail: 'test@136s7.com',
		personalisation: {
			appeal_reference_number: '134526',
			lpa_reference: '48269/APP/2021/1482',
			site_address: '96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
			withdrawal_date: '01 January 2025'
		},
		appeal: {
			id: 'mock-appeal-generic-id',
			reference: '134526'
		},
		startDate: new Date('2025-01-01')
	};

	const expectedContent = [
		'# Appeal details',
		'',
		'^Appeal reference number: 134526',
		'Address: 96 The Avenue, Leftfield, Maidstone, Kent, MD21 5XY, United Kingdom',
		'Planning application reference: 48269/APP/2021/1482',
		'',
		'# Appeal withdrawn',
		'',
		'We have withdrawn this appeal following your request on 01 January 2025.',
		'',
		'# Next steps',
		'',
		'Your case will be closed.',
		'',
		'Any appointments made for this appeal will be cancelled.',
		'',
		'The planning department that refused your application has been informed.',
		'',
		'# Feedback',
		'',
		'We welcome your feedback on our appeals process. Tell us on this short [feedback form](https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u).',
		'',
		'The Planning Inspectorate',
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
			subject: 'Appeal withdrawn: 134526'
		}
	);
});
