import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';
import { FRONT_OFFICE_DASHBOARD_PATH_STUBS } from '@pins/appeals/constants/common.js';

describe('costs-decision-all-parties.md', () => {
	const appealReference = '134526';
	const caseTeamEmail = 'enquiries@planninginspectorate.gov.uk';
	const frontOfficeUrl = '/mock-front-office-url';

	const createNotifyData = (personalisation) => ({
		doNotMockNotifySend: true,
		templateName: 'costs-decision-all-parties',
		notifyClient: {
			sendEmail: jest.fn()
		},
		recipientEmail: 'test@136s7.com',
		personalisation: {
			appeal_reference_number: appealReference,
			front_office_url: frontOfficeUrl,
			case_team_email_address: caseTeamEmail,
			...personalisation
		}
	});

	const buildExpectedContent = (expectedLink) =>
		[
			`We have made a decision on the application for an award of appeal costs on appeal ${appealReference}.`,
			'',
			`You can [view this information in the appeal service](${expectedLink}).`,
			'',
			'We have informed all main parties of the decision.',
			'',
			'Planning Inspectorate',
			caseTeamEmail
		].join('\n');

	test('should render appellant URL when appellant fo_dashboard_stub is provided', async () => {
		const notifySendData = createNotifyData({
			fo_dashboard_stub: FRONT_OFFICE_DASHBOARD_PATH_STUBS.APPELLANT
		});

		await notifySend(notifySendData);

		const expectedContent = buildExpectedContent(
			`${frontOfficeUrl}/${FRONT_OFFICE_DASHBOARD_PATH_STUBS.APPELLANT}/${appealReference}`
		);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: `Appeal costs decision: ${appealReference}`
			}
		);
	});

	test('should render LPA URL when LPA fo_dashboard_stub is provided', async () => {
		const notifySendData = createNotifyData({
			fo_dashboard_stub: FRONT_OFFICE_DASHBOARD_PATH_STUBS.LPA
		});

		await notifySend(notifySendData);

		const expectedContent = buildExpectedContent(
			`${frontOfficeUrl}/${FRONT_OFFICE_DASHBOARD_PATH_STUBS.LPA}/${appealReference}`
		);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: `Appeal costs decision: ${appealReference}`
			}
		);
	});

	test('should render Rule 6 URL when Rule 6 fo_dashboard_stub is provided', async () => {
		const notifySendData = createNotifyData({
			fo_dashboard_stub: FRONT_OFFICE_DASHBOARD_PATH_STUBS.RULE_6_PARTY
		});

		await notifySend(notifySendData);

		const expectedContent = buildExpectedContent(
			`${frontOfficeUrl}/${FRONT_OFFICE_DASHBOARD_PATH_STUBS.RULE_6_PARTY}/${appealReference}`
		);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: `Appeal costs decision: ${appealReference}`
			}
		);
	});

	test('should render Interested Party URL when Interested Party fo_dashboard_stub is provided', async () => {
		const notifySendData = createNotifyData({
			fo_dashboard_stub: FRONT_OFFICE_DASHBOARD_PATH_STUBS.INTERESTED_PARTY
		});

		await notifySend(notifySendData);

		const expectedContent = buildExpectedContent(
			`${frontOfficeUrl}/${FRONT_OFFICE_DASHBOARD_PATH_STUBS.INTERESTED_PARTY}/${appealReference}`
		);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: `Appeal costs decision: ${appealReference}`
			}
		);
	});
});
