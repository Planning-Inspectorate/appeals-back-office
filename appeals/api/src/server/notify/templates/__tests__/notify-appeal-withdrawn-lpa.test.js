import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

test('should call notify sendEmail for appeal-withdrawn-lpa with the correct data', async () => {
	const notifySendData = {
		doNotMockNotifySend: true,
		templateName: 'appeal-withdrawn-lpa',
		notifyClient: {
			sendEmail: jest.fn()
		},
		recipientEmail: 'test@136s7.com',
		personalisation: {
			appeal_reference_number: '234567',
			lpa_reference: '48269/APP/2021/1483',
			site_address: '98 The Avenue, Leftfield, Maidstone, Kent, MD21 5YY, United Kingdom',
			withdrawal_date: '03 January 2025',
			event_set: true,
			event_type: 'site visit'
		},
		appeal: {
			id: 'mock-appeal-generic-id',
			reference: '234567'
		},
		startDate: new Date('2025-01-01')
	};

	const expectedContent = [
		"We have withdrawn the appeal after the appellant's request.",
		'',
		'# Appeal details',
		'',
		'^Appeal reference number: 234567',
		'Address: 98 The Avenue, Leftfield, Maidstone, Kent, MD21 5YY, United Kingdom',
		'Planning application reference: 48269/APP/2021/1483',
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
			subject: 'Appeal withdrawn: 234567'
		}
	);
});

test('should call notify sendEmail for appeal-withdrawn-lpa without site visit cancellation', async () => {
	const notifySendData = {
		doNotMockNotifySend: true,
		templateName: 'appeal-withdrawn-lpa',
		notifyClient: {
			sendEmail: jest.fn()
		},
		recipientEmail: 'test@136s7.com',
		personalisation: {
			appeal_reference_number: '234567',
			lpa_reference: '48269/APP/2021/1483',
			site_address: '98 The Avenue, Leftfield, Maidstone, Kent, MD21 5YY, United Kingdom',
			withdrawal_date: '03 January 2025',
			event_set: false,
			event_type: ''
		},
		appeal: {
			id: 'mock-appeal-generic-id',
			reference: '234567'
		},
		startDate: new Date('2025-01-01')
	};

	const expectedContent = [
		"We have withdrawn the appeal after the appellant's request.",
		'',
		'# Appeal details',
		'',
		'^Appeal reference number: 234567',
		'Address: 98 The Avenue, Leftfield, Maidstone, Kent, MD21 5YY, United Kingdom',
		'Planning application reference: 48269/APP/2021/1483',
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
			subject: 'Appeal withdrawn: 234567'
		}
	);
});

test('should call notify sendEmail for appeal-withdrawn-lpa with the correct data for hearing', async () => {
	const notifySendData = {
		doNotMockNotifySend: true,
		templateName: 'appeal-withdrawn-lpa',
		notifyClient: {
			sendEmail: jest.fn()
		},
		recipientEmail: 'test@136s7.com',
		personalisation: {
			appeal_reference_number: '234567',
			lpa_reference: '48269/APP/2021/1483',
			site_address: '98 The Avenue, Leftfield, Maidstone, Kent, MD21 5YY, United Kingdom',
			withdrawal_date: '03 January 2025',
			event_set: true,
			event_type: 'hearing'
		},
		appeal: {
			id: 'mock-appeal-generic-id',
			reference: '234567'
		},
		startDate: new Date('2025-01-01')
	};

	const expectedContent = [
		"We have withdrawn the appeal after the appellant's request.",
		'',
		'# Appeal details',
		'',
		'^Appeal reference number: 234567',
		'Address: 98 The Avenue, Leftfield, Maidstone, Kent, MD21 5YY, United Kingdom',
		'Planning application reference: 48269/APP/2021/1483',
		'',
		'# What happens next',
		'',
		'We have closed the appeal and cancelled the hearing.',
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
			subject: 'Appeal withdrawn: 234567'
		}
	);
});
