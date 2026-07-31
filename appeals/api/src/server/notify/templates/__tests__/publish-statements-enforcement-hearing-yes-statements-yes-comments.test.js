import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('publish-statements-enforcement-hearing-yes-statements-yes-comments.md', () => {
	const basePersonalisation = {
		appeal_reference_number: 'ABC45678',
		site_address: '10, Test Street',
		lpa_reference: '12345XYZ',
		front_office_url: '/mock-front-office-url/appeals/ABC45678',
		final_comments_due_date: '15 April 2026',
		team_email_address: 'caseofficers@planninginspectorate.gov.uk'
	};

	const notifyClient = { sendEmail: jest.fn() };
	const recipientEmail = 'test@example.com';

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should render correctly with hearing details and enforcement reference', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-enforcement-hearing-yes-statements-yes-comments',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				enforcement_reference: 'ENF-12345',
				hearing_date: '15 March 2025',
				hearing_time: '10:00am',
				hearing_expected_days: 2,
				inspector_name: 'J Smith',
				hearing_address: '10, Test Street'
			}
		};

		const expectedContent = [
			'# Documents received',
			'',
			'- appellant’s statement',
			'- local planning authority’s statement',
			'- comments from interested parties',
			'',
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Enforcement notice reference: ENF-12345',
			'',
			'# Hearing details',
			'',
			'^Date: 15 March 2025',
			'Time: 10:00am',
			'Expected days: 2',
			'Inspector: J Smith',
			'Venue address: 10, Test Street',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'',
			'# What happens next',
			'',
			'You need to submit your final comments by 15 April 2026.',
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
				subject: 'New information: comments and statements on ABC45678'
			}
		);
	});

	test('should render correctly with planning application reference for LDC appeal', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-enforcement-hearing-yes-statements-yes-comments',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				hearing_date: '15 March 2025',
				hearing_time: '10:00am',
				hearing_expected_days: 2,
				inspector_name: 'J Smith',
				hearing_address: '10, Test Street'
			}
		};

		const expectedContent = [
			'# Documents received',
			'',
			'- appellant’s statement',
			'- local planning authority’s statement',
			'- comments from interested parties',
			'',
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# Hearing details',
			'',
			'^Date: 15 March 2025',
			'Time: 10:00am',
			'Expected days: 2',
			'Inspector: J Smith',
			'Venue address: 10, Test Street',
			'',
			'',
			'We will contact you if we make any changes to the hearing.',
			'',
			'',
			'# What happens next',
			'',
			'You need to submit your final comments by 15 April 2026.',
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
				subject: 'New information: comments and statements on ABC45678'
			}
		);
	});

	test('should render correctly when hearing date is not set up', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'publish-statements-enforcement-hearing-yes-statements-yes-comments',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation,
				enforcement_reference: 'ENF-12345',
				hearing_date: null
			}
		};

		const expectedContent = [
			'# Documents received',
			'',
			'- appellant’s statement',
			'- local planning authority’s statement',
			'- comments from interested parties',
			'',
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Enforcement notice reference: ENF-12345',
			'',
			'We will contact you by email when we set up the hearing.',
			'',
			'',
			'# What happens next',
			'',
			'You need to submit your final comments by 15 April 2026.',
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
				subject: 'New information: comments and statements on ABC45678'
			}
		);
	});
});
