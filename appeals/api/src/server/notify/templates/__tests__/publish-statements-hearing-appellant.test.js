import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('publish-statements-hearing-appellant.md', () => {
	const basePersonalisation = {
		appeal_reference_number: 'ABC45678',
		site_address: '10, Test Street',
		lpa_reference: '12345XYZ',
		team_email_address: 'caseofficers@planninginspectorate.gov.uk'
	};

	const notifyClient = { sendEmail: jest.fn() };
	const recipientEmail = 'test@136s7.com';

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should render correctly when both lpa statement and ip comments received with hearing date', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-hearing-appellant',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: true,
				has_ip_comments: true,
				hearing_date: '15 March 2025'
			}
		};

		const expectedContent = [
			"We have received the local planning authority's questionnaire, all statements and comments from interested parties.",
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'Your hearing is on 15 March 2025.',
			'We will contact you if we need any more information.',
			'',
			'Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			recipientEmail,
			{
				content: expectedContent,
				subject:
					"We have received the local planning authority's questionnaire, all statements and comments from interested parties: ABC45678"
			}
		);
	});

	test('should render correctly when only lpa statement received', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-hearing-appellant',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: true,
				has_ip_comments: false,
				hearing_date: '15 March 2025'
			}
		};

		const expectedContent = [
			'We have received a statement from the local planning authority.',
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'We did not receive any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'Your hearing is on 15 March 2025.',
			'We will contact you if we need any more information.',
			'',
			'Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			recipientEmail,
			{
				content: expectedContent,
				subject:
					"We have received the local planning authority's questionnaire, all statements and comments from interested parties: ABC45678"
			}
		);
	});

	test('should render correctly when only ip comments received', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-hearing-appellant',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: false,
				has_ip_comments: true,
				hearing_date: '15 March 2025'
			}
		};

		const expectedContent = [
			'We have received comments from interested parties.',
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'The local planning authority did not submit a statement.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'Your hearing is on 15 March 2025.',
			'We will contact you if we need any more information.',
			'',
			'Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			recipientEmail,
			{
				content: expectedContent,
				subject:
					"We have received the local planning authority's questionnaire, all statements and comments from interested parties: ABC45678"
			}
		);
	});

	test('should render correctly when neither lpa statement nor ip comments received', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-hearing-appellant',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: false,
				has_ip_comments: false,
				hearing_date: '15 March 2025'
			}
		};

		const expectedContent = [
			'The local planning authority did not submit a statement.',
			'We did not receive any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'Your hearing is on 15 March 2025.',
			'We will contact you if we need any more information.',
			'',
			'Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		await notifySend(notifySendData);

		expect(notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			recipientEmail,
			{
				content: expectedContent,
				subject:
					"We have received the local planning authority's questionnaire, all statements and comments from interested parties: ABC45678"
			}
		);
	});

	test('should render correctly when hearing not yet set up', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-hearing-appellant',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: true,
				has_ip_comments: true,
				hearing_date: null
			}
		};

		const expectedContent = [
			"We have received the local planning authority's questionnaire, all statements and comments from interested parties.",
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'We will contact you if we need any more information.',
			'',
			'Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		].join('\n');

		// @ts-ignore
		await notifySend(notifySendData);

		expect(notifyClient.sendEmail).toHaveBeenCalledWith(
			{ id: 'mock-appeal-generic-id' },
			recipientEmail,
			{
				content: expectedContent,
				subject:
					"We have received the local planning authority's questionnaire, all statements and comments from interested parties: ABC45678"
			}
		);
	});
});
