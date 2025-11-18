// @ts-nocheck
import { notifySend } from '#notify/notify-send.js';
import { jest } from '@jest/globals';
describe('received-statement-and-ip-comments-appellant.md', () => {
	let notifySendData;
	let expectedTailContent;
	beforeEach(() => {
		notifySendData = {
			doNotMockNotifySend: true,
			templateName: 'received-statement-and-ip-comments-appellant',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				appeal_reference_number: 'ABC45678',
				site_address: '10, Test Street',
				lpa_reference: '12345XYZ',
				final_comments_deadline: '01 January 2021',
				has_statement: true,
				has_ip_comments: true,
				what_happens_next:
					'You need to [submit your final comments](/mock-front-office-url/appeals/ABC45678) by 01 January 2021.',
				subject: 'Submit your final comments',
				team_email_address: 'caseofficers@planninginspectorate.gov.uk'
			}
		};
		expectedTailContent = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'# What happens next',
			'',
			'You need to [submit your final comments](/mock-front-office-url/appeals/ABC45678) by 01 January 2021.',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		];
	});
	test('should call notify sendEmail with the correct data when there is both a statement and ip comments', async () => {
		const expectedContent = [
			"We have received the local planning authority's questionnaire, all statements and comments from interested parties.",
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			...expectedTailContent
		].join('\n');
		await notifySend(notifySendData);
		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Submit your final comments: ABC45678'
			}
		);
	});
	test('should call notify sendEmail with the correct data when there is a statement but no ip comments', async () => {
		const expectedContent = [
			'We have received comments from interested parties.',
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'The local planning authority did not submit a statement.',
			...expectedTailContent
		].join('\n');
		notifySendData.personalisation.has_statement = false;
		await notifySend(notifySendData);
		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Submit your final comments: ABC45678'
			}
		);
	});
	test('should call notify sendEmail with the correct data when there are ip comments but no statement', async () => {
		const expectedContent = [
			'We have received a statement from the local planning authority.',
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			'We did not receive any comments from interested parties.',
			...expectedTailContent
		].join('\n');
		notifySendData.personalisation.has_ip_comments = false;
		await notifySend(notifySendData);
		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Submit your final comments: ABC45678'
			}
		);
	});

	test('should call notify sendEmail with the correct data when there is both a statement and ip comments but no what_happens_next', async () => {
		const expectedTailContentWithoutWhatHappensNext = [
			'# Appeal details',
			'',
			'^Appeal reference number: ABC45678',
			'Address: 10, Test Street',
			'Planning application reference: 12345XYZ',
			'',
			'The Planning Inspectorate',
			'caseofficers@planninginspectorate.gov.uk'
		];

		const expectedContent = [
			"We have received the local planning authority's questionnaire, all statements and comments from interested parties.",
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			...expectedTailContentWithoutWhatHappensNext
		].join('\n');

		notifySendData.personalisation.what_happens_next = '';

		await notifySend(notifySendData);
		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject: 'Submit your final comments: ABC45678'
			}
		);
	});
	test('should call notify sendEmail with the correct data when a hearing procedure', async () => {
		const expectedContent = [
			"We have received the local planning authority's questionnaire, all statements and comments from interested parties.",
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			...expectedTailContent
		].join('\n');

		notifySendData.personalisation.is_hearing_procedure = true;

		await notifySend(notifySendData);
		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject:
					"We have received the local planning authority's questionnaire, all statements and comments from interested parties: ABC45678"
			}
		);
	});
	test('should call notify sendEmail with the correct data when a inquiry procedure', async () => {
		const expectedContent = [
			"We have received the local planning authority's questionnaire, all statements and comments from interested parties.",
			'You can [view this information in the appeals service](/mock-front-office-url/appeals/ABC45678).',
			...expectedTailContent
		].join('\n');

		notifySendData.personalisation.is_inquiry_procedure = true;

		await notifySend(notifySendData);
		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{
				content: expectedContent,
				subject:
					"We have received the local planning authority's questionnaire, all statements and comments from interested parties: ABC45678"
			}
		);
	});
});
