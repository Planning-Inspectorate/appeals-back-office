// @ts-nocheck
import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

const interestedPartyEmail = 'interested-party@example.com';

const genericNotifySendData = {
	doNotMockNotifySend: true,
	templateName: 'decision-is-allowed-split-dismissed-interested-party',
	notifyClient: {
		sendEmail: jest.fn()
	},
	recipientEmail: interestedPartyEmail,
	personalisation: {
		appeal_reference_number: 'ABC45678',
		site_address: '10, Test Street',
		lpa_reference: '12345XYZ',
		decision_date: '01 January 2021',
		front_office_url: '/mock-front-office-url',
		feedback_link: '/mock-feedback-link',
		case_team_email_address: 'caseofficers@planninginspectorate.gov.uk'
	}
};

const expectedContentRows = (replacementRows) => [
	'# Appeal details',
	'',
	'^Appeal reference number: ABC45678',
	'Address: 10, Test Street',
	'Planning application reference: 12345XYZ',
	'',
	'# Appeal decision',
	'',
	...replacementRows,
	'',
	'[View the decision letter](/mock-front-office-url/appeals/ABC45678) dated 01 January 2021.',
	'',
	'We have informed the appellant and local planning authority about the decision.',
	'',
	"# The Planning Inspectorate's role",
	'',
	'The Planning Inspectorate cannot change or revoke the decision. Only the High Court can change this decision.',
	'',
	'# Feedback',
	'',
	'We welcome your feedback on our appeals service. Tell us on this short [feedback form](/mock-feedback-link).',
	'',
	'The Planning Inspectorate',
	'caseofficers@planninginspectorate.gov.uk'
];

describe('decision-is-allowed-split-dismissed-interested-party.md', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should call notify sendEmail with the correct data', async () => {
		const notifySendData = structuredClone({ ...genericNotifySendData, notifyClient: {} });
		notifySendData.notifyClient.sendEmail = jest.fn();

		const expectedContent = expectedContentRows(['We have made a decision on this appeal']).join(
			'\n'
		);

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			interestedPartyEmail,
			{
				content: expectedContent,
				subject: 'Appeal decision: ABC45678'
			}
		);
	});

	test('should call notify sendEmail with the correct data when a linked appeal', async () => {
		const notifySendData = structuredClone({ ...genericNotifySendData, notifyClient: {} });
		notifySendData.notifyClient.sendEmail = jest.fn();
		notifySendData.personalisation.child_appeals = ['CHILD123', 'CHILD456', 'CHILD789'];

		const expectedContent = expectedContentRows([
			'We have made a decision on the following appeals:',
			'',
			'- ABC45678 (lead)',
			'- CHILD123',
			'- CHILD456',
			'- CHILD789'
		]).join('\n');

		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			interestedPartyEmail,
			{
				content: expectedContent,
				subject: 'Appeal decision: ABC45678'
			}
		);
	});
});
