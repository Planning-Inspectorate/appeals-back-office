import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('publish-statements-inquiry-rule-6.md', () => {
	const basePersonalisation = {
		appeal_reference_number: 'ABC45678',
		site_address: '10, Test Street',
		lpa_reference: '12345XYZ',
		proof_of_evidence_due_date: '20 October 2025',
		team_email_address: 'caseofficers@planninginspectorate.gov.uk'
	};

	const notifyClient = { sendEmail: jest.fn() };
	const recipientEmail = 'test@136s7.com';

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should render correctly when nothing received', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-inquiry-rule-6',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: false,
				has_ip_comments: false,
				has_rule_6_statement: false,
				has_rule_6_parties: false
			}
		};

		const expectedContent = [
			'We did not receive any statements or any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit your proof of evidence and witnesses](/mock-front-office-url/rule-6/ABC45678) by 20 October 2025.',
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
					'We did not receive any statements or any comments from interested parties: ABC45678'
			}
		);
	});

	test('should render correctly when only rule 6 statement received without lpa statement', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-inquiry-rule-6',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: false,
				has_ip_comments: false,
				has_rule_6_statement: true,
				has_rule_6_parties: true
			}
		};

		const expectedContent = [
			'We have received your statement.',
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
			'We will contact you when:',
			'   - the local planning authority and any other parties have submitted their statements',
			'   - we have received comments from interested parties',
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
				subject: 'Submit your proof of evidence and witnesses: ABC45678'
			}
		);
	});

	test('should render correctly when lpa statement and rule 6 parties but no rule 6 statement', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-inquiry-rule-6',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: true,
				has_ip_comments: false,
				has_rule_6_statement: false,
				has_rule_6_parties: true
			}
		};

		const expectedContent = [
			"We have received the local planning authority's questionnaire and any comments from interested parties.",
			'You can [view this information in the appeals service](/mock-front-office-url/rule-6/ABC45678).',
			'We did not receive any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit your proof of evidence and witnesses](/mock-front-office-url/rule-6/ABC45678) by 20 October 2025.',
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
				subject: 'Submit your proof of evidence and witnesses: ABC45678'
			}
		);
	});

	test('should render correctly when lpa statement and ip comments received', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-inquiry-rule-6',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: true,
				has_ip_comments: true,
				has_rule_6_statement: false,
				has_rule_6_parties: true
			}
		};

		const expectedContent = [
			"We have received the local planning authority's questionnaire and any comments from interested parties.",
			'You can [view this information in the appeals service](/mock-front-office-url/rule-6/ABC45678).',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit your proof of evidence and witnesses](/mock-front-office-url/rule-6/ABC45678) by 20 October 2025.',
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
				subject: 'Submit your proof of evidence and witnesses: ABC45678'
			}
		);
	});

	test('should render correctly when only lpa statement received', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-inquiry-rule-6',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: true,
				has_ip_comments: false,
				has_rule_6_statement: false,
				has_rule_6_parties: false
			}
		};

		const expectedContent = [
			'We have received a statement from the local planning authority.',
			'You can [view this information in the appeals service](/mock-front-office-url/rule-6/ABC45678).',
			'We did not receive any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit your proof of evidence and witnesses](/mock-front-office-url/rule-6/ABC45678) by 20 October 2025.',
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
				subject: 'Submit your proof of evidence and witnesses: ABC45678'
			}
		);
	});

	test('should render correctly when only ip comments received', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-inquiry-rule-6',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: false,
				has_ip_comments: true,
				has_rule_6_statement: false,
				has_rule_6_parties: false
			}
		};

		const expectedContent = [
			'We have received comments from interested parties.',
			'You can [view this information in the appeals service](/mock-front-office-url/rule-6/ABC45678).',
			'The local planning authority did not submit a statement.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit your proof of evidence and witnesses](/mock-front-office-url/rule-6/ABC45678) by 20 October 2025.',
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
				subject: 'Submit your proof of evidence and witnesses: ABC45678'
			}
		);
	});

	test('should render correctly when lpa statement and rule 6 statement received', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-inquiry-rule-6',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				has_lpa_statement: true,
				has_ip_comments: false,
				has_rule_6_statement: true,
				has_rule_6_parties: true
			}
		};

		const expectedContent = [
			'We have received:',
			'   - all statements',
			'   - comments from interested parties',
			'You can [view this information in the appeals service](/mock-front-office-url/rule-6/ABC45678).',
			'We did not receive any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit your proof of evidence and witnesses](/mock-front-office-url/rule-6/ABC45678) by 20 October 2025.',
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
				subject: 'We have received your statement: ABC45678'
			}
		);
	});
});
