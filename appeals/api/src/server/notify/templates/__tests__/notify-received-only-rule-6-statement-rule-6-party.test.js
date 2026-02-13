import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';

describe('received-only-rule-6-statement-rule-6-party.md', () => {
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

	test('should email rule 6 when only rule 6 submits a statement', async () => {
		const notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'received-only-rule-6-statement-rule-6-party',
			notifyClient,
			recipientEmail,
			personalisation: {
				...basePersonalisation
			}
		};

		const expectedContent = [
			'We have received your statement.',
			'',
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'We will contact you when:',
			'- the local planning authority and any other parties have submitted their statements',
			'- we have received comments from interested parties',
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
				subject: 'We have received your statement: ABC45678'
			}
		);
	});
});
