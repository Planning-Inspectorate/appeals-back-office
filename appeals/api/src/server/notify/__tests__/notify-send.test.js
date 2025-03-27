// @ts-nocheck
import { jest } from '@jest/globals';
import notifySend from '#notify/notify-send.js';
import { ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL } from '@pins/appeals/constants/support.js';

jest.unstable_mockModule('fs', () => ({
	readFileSync: jest.fn().mockReturnValue('Hello ((first_name)) ((last_name))')
}));

describe('notify-send', () => {
	let notifySendData;

	beforeEach(() => {
		notifySendData = {
			templateName: 'test',
			subjectTemplate: 'test',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				first_name: 'Joe',
				last_name: 'Bloggs'
			}
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should throw the failed to send error when no parameters passed in', async () => {
		await expect(async () => await notifySend({})).rejects.toThrow(
			new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL)
		);
	});

	test('should throw the failed to send error when the template expects missing personalisation parameters', async () => {
		await expect(async () => await notifySend(notifySendData)).rejects.toThrow(
			new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL)
		);
	});

	test('should send a notification', async () => {
		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith({});
	});
});
