import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('enforcement-appeal-invalid-appellant.content.md', () => {
	test('should call notify sendEmail with the correct content (groundAbarred + otherLiveAppeals: true)', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-appeal-invalid-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				enforcement_reference: 'ENF-12345',
				reasons: 'You submitted the appeal outside the allowed time period.',
				groundAbarred: true,
				otherLiveAppeals: true,
				effective_date: '1 January 2026',
				case_team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We have reviewed the appeal and it is not valid.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Enforcement notice reference: ENF-12345',
			'',
			'# Why the appeal is invalid',
			'You submitted the appeal outside the allowed time period.',
			'',
			'# Ground (a) barred',
			'We cannot consider ground (a) because the enforcement notice was issued:',
			'* after you made a related planning application',
			'* within 2 years from the date the application or appeal made stopped being considered',
			'',
			'Your appeal does not meet the requirements for this ground from section 174(2A to 2B) of the Town and Country Planning Act 1990.',
			'',
			'# What happens next',
			'Your appeal is now closed.  We have told the local planning authority.',
			'The enforcement notice will not take effect unless we dismiss the other appeal or someone withdraws it.',
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
				subject: 'Appeal invalid: ABC45678'
			}
		);
	});

	test('should call notify sendEmail with the correct content (groundAbarred + otherLiveAppeals: false)', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-appeal-invalid-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'XYZ12345',
				site_address: '25, Example Road',
				enforcement_reference: 'ENF-67890',
				reasons: 'The appellant does not have sufficient legal interest in the land.',
				groundAbarred: true,
				otherLiveAppeals: false,
				effective_date: '15 February 2026',
				case_team_email_address: 'enforcement@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We have reviewed the appeal and it is not valid.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: XYZ12345',
			'Address: 25, Example Road',
			'Enforcement notice reference: ENF-67890',
			'',
			'# Why the appeal is invalid',
			'The appellant does not have sufficient legal interest in the land.',
			'',
			'# Ground (a) barred',
			'We cannot consider ground (a) because the enforcement notice was issued:',
			'* after you made a related planning application',
			'* within 2 years from the date the application or appeal made stopped being considered',
			'',
			'Your appeal does not meet the requirements for this ground from section 174(2A to 2B) of the Town and Country Planning Act 1990.',
			'',
			'# What happens next',
			'Your appeal is now closed.  We have told the local planning authority.',
			'The compliance period for the enforcement notice starts from 15 February 2026.',
			'',
			'Planning Inspectorate',
			'enforcement@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Appeal invalid: XYZ12345'
			}
		);
	});

	test('should call notify sendEmail with the correct content (no groundAbarred + otherLiveAppeals: true)', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-appeal-invalid-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'DEF99999',
				site_address: '42, Sample Avenue',
				enforcement_reference: 'ENF-11111',
				reasons: 'The appeal was submitted by someone who is not the appellant.',
				groundAbarred: false,
				otherLiveAppeals: true,
				effective_date: '20 March 2026',
				case_team_email_address: 'appeals@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We have reviewed the appeal and it is not valid.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: DEF99999',
			'Address: 42, Sample Avenue',
			'Enforcement notice reference: ENF-11111',
			'',
			'# Why the appeal is invalid',
			'The appeal was submitted by someone who is not the appellant.',
			'',
			'# What happens next',
			'Your appeal is now closed.  We have told the local planning authority.',
			'The enforcement notice will not take effect unless we dismiss the other appeal or someone withdraws it.',
			'',
			'Planning Inspectorate',
			'appeals@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Appeal invalid: DEF99999'
			}
		);
	});

	test('should call notify sendEmail with the correct content (no groundAbarred + otherLiveAppeals)', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'enforcement-appeal-invalid-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'GHI55555',
				site_address: '88, Main Street',
				enforcement_reference: 'ENF-22222',
				reasons: 'Required documents were not provided.',
				groundAbarred: false,
				otherLiveAppeals: false,
				effective_date: '5 April 2026',
				case_team_email_address: 'support@planninginspectorate.gov.uk'
			}
		};

		const expectedContent = [
			'We have reviewed the appeal and it is not valid.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: GHI55555',
			'Address: 88, Main Street',
			'Enforcement notice reference: ENF-22222',
			'',
			'# Why the appeal is invalid',
			'Required documents were not provided.',
			'',
			'# What happens next',
			'Your appeal is now closed.  We have told the local planning authority.',
			'The compliance period for the enforcement notice starts from 5 April 2026.',
			'',
			'Planning Inspectorate',
			'support@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Appeal invalid: GHI55555'
			}
		);
	});
});
