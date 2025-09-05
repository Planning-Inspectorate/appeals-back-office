import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

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
			withdrawal_date: '01 January 2025',
			event_set: true,
			event_type: 'site visit'
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
		'We have withdrawn the appeal following your request on 01 January 2025.',
		'',
		'# What happens next',
		'',
		'We have closed the appeal and cancelled the site visit.',
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

test('should call notify sendEmail for appeal-withdrawn-appellant without event_type when event_set is false', async () => {
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
			withdrawal_date: '01 January 2025',
			event_set: false
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
		'We have withdrawn the appeal following your request on 01 January 2025.',
		'',
		'# What happens next',
		'',
		'We have closed the appeal.',
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
