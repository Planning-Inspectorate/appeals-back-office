import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('received-statement-and-ip-comments-lpa.md', () => {
	const basePersonalisation = {
		appeal_reference_number: 'ABC45678',
		site_address: '10, Test Street',
		lpa_reference: '12345XYZ',
		final_comments_deadline: '01 January 2021',
		subject: 'Submit your final comments'
	};

	const notifyClient = { sendEmail: jest.fn() };
	const recipientEmail = 'test@136s7.com';

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should include positive content and link when has_ip_comments true without what_happens_next', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'received-statement-and-ip-comments-lpa',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_ip_comments: true
			}
		};

		const expectedContent = [
			'We’ve received comments from interested parties.',
			'You can [view this information in the appeals service](/mock-front-office-url/manage-appeals/ABC45678).',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			recipientEmail,
			{
				content: expectedContent,
				subject: 'Submit your final comments: ABC45678'
			}
		);
	});

	test('should not include positive content and link when has_ip_comments false without what_happens_next', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'received-statement-and-ip-comments-lpa',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_ip_comments: false
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			recipientEmail,
			{
				content: expectedContent,
				subject: 'Submit your final comments: ABC45678'
			}
		);
	});

	test('should include positive content and link when has_ip_comments true with what_happens_next', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'received-statement-and-ip-comments-lpa',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_ip_comments: true,
				what_happens_next:
					'You need to [submit your final comments](/mock-front-office-url/manage-appeals/ABC45678) by 01 January 2021.'
			}
		};

		const expectedContent = [
			'We’ve received comments from interested parties.',
			'You can [view this information in the appeals service](/mock-front-office-url/manage-appeals/ABC45678).',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit your final comments](/mock-front-office-url/manage-appeals/ABC45678) by 01 January 2021.',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			recipientEmail,
			{
				content: expectedContent,
				subject: 'Submit your final comments: ABC45678'
			}
		);
	});

	test('should not include positive content and link when has_ip_comments false with what_happens_next', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'received-statement-and-ip-comments-lpa',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_ip_comments: false,
				what_happens_next:
					'You need to [submit your final comments](/mock-front-office-url/manage-appeals/ABC45678) by 01 January 2021.'
			}
		};

		const expectedContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit your final comments](/mock-front-office-url/manage-appeals/ABC45678) by 01 January 2021.',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			recipientEmail,
			{
				content: expectedContent,
				subject: 'Submit your final comments: ABC45678'
			}
		);
	});
});
