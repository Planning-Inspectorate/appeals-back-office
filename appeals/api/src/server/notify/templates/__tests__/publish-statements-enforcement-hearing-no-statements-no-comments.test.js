import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('publish-statements-enforcement-hearing-no-statements-no-comments.md', () => {
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

	test('should render correctly when hearing date exists', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-enforcement-hearing-no-statements-no-comments',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				hearing_date: '15 October 2025',
				hearing_time: '10:00 AM',
				hearing_expected_days: 5,
				inspector_name: 'John Doe',
				hearing_address: '10, Test Street, London, UK'
			}
		};

		const expectedContent = [
			'We did not receive a statement from the local planning authority, the appellant or any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# Hearing details',
			'Date: 15 October 2025',
			'Time: 10:00 AM',
			'Expected days: 5',
			'',
			'Inspector: John Doe',
			'',
			'Venue address: 10, Test Street, London, UK',
			'',
			'We will contact you if we make any changes to the hearing.',
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
				subject: 'New information: comments and statements on ABC45678'
			}
		);
	});

	test('should render correctly when hearing date exists but no hearing address', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-enforcement-hearing-no-statements-no-comments',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				hearing_date: '15 October 2025',
				hearing_time: '10:00 AM',
				hearing_expected_days: 5,
				inspector_name: 'John Doe',
				hearing_address: ''
			}
		};

		const expectedContent = [
			'We did not receive a statement from the local planning authority, the appellant or any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# Hearing details',
			'Date: 15 October 2025',
			'Time: 10:00 AM',
			'Expected days: 5',
			'',
			'Inspector: John Doe',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
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
				subject: 'New information: comments and statements on ABC45678'
			}
		);
	});

	test('should render correctly when hearing date exists and no inspector name is provided', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-enforcement-hearing-no-statements-no-comments',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				hearing_date: '15 October 2025',
				hearing_time: '10:00 AM',
				hearing_expected_days: 5,
				inspector_name: '',
				hearing_address: '10, Test Street, London, UK'
			}
		};

		const expectedContent = [
			'We did not receive a statement from the local planning authority, the appellant or any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# Hearing details',
			'Date: 15 October 2025',
			'Time: 10:00 AM',
			'Expected days: 5',
			'',
			'',
			'Venue address: 10, Test Street, London, UK',
			'',
			'We will contact you if we make any changes to the hearing.',
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
				subject: 'New information: comments and statements on ABC45678'
			}
		);
	});

	test('should render correctly when hearing date does not exist', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-enforcement-hearing-no-statements-no-comments',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				hearing_date: '',
				hearing_time: '',
				hearing_expected_days: 0,
				inspector_name: '',
				hearing_address: '10, Test Street, London, UK'
			}
		};

		const expectedContent = [
			'We did not receive a statement from the local planning authority, the appellant or any comments from interested parties.',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'We will contact you by email when we set up the hearing.',
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
				subject: 'New information: comments and statements on ABC45678'
			}
		);
	});
});
