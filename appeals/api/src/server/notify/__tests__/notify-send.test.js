// @ts-nocheck
import { jest } from '@jest/globals';
import mockFileSystem from 'mock-fs';
import { notifySend } from '#notify/notify-send.js';
import {
	ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL
} from '@pins/appeals/constants/support.js';
import { fileURLToPath } from 'url';
import path from 'path';
import stringTokenReplacement from '#utils/string-token-replacement.js';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const templatesPath = path.join(__dirname, '../', 'templates');

describe('notify-send', () => {
	let notifySendData;

	beforeEach(() => {
		mockFileSystem({
			[templatesPath]: {
				'test-template.subject.md': 'Subject for ((first_name)) ((last_name))',
				'test-template.content.md': 'Content for ((first_name)) ((last_name))',
				'corrupt-template.subject.md': 'Subject for ((first_name)) ((last_name))',
				'corrupt-template.content.md':
					'Content for ((gaps in variable name)) text here ((this_one_is_ok)) ((Uppercase_variable_name)) other text here ((contains_special_characters_**)) ((10_started_with_numeric)) more text here ((_started_with_underscore))'
			}
		});

		notifySendData = {
			templateName: 'test-template',
			notifyClient: {
				sendEmail: jest.fn()
			},
			recipientEmail: 'test@136s7.com',
			personalisation: {
				first_name: 'Joe',
				last_name: 'Bloggs'
			},
			doNotMockNotifySend: true
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
		mockFileSystem.restore();
	});

	test('should throw the failed to populate error when the template is corrupt', async () => {
		await expect(
			async () => await notifySend({ ...notifySendData, templateName: 'corrupt-template' })
		).rejects.toThrow(
			new Error(
				stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
					'the following corrupt parameter definitions in the template: ' +
						[
							'((gaps in variable name))',
							'((Uppercase_variable_name))',
							'((contains_special_characters_**))',
							'((10_started_with_numeric))',
							'((_started_with_underscore))'
						].join(', ')
				])
			)
		);
	});

	test('should throw the failed to populate error when no parameters passed in', async () => {
		await expect(async () => await notifySend({ doNotMockNotifySend: true })).rejects.toThrow(
			new Error(
				stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
					'a missing template name'
				])
			)
		);
	});

	test('should throw the failed to populate error when the template expects missing personalisation parameters', async () => {
		delete notifySendData.personalisation.first_name;
		await expect(async () => await notifySend(notifySendData)).rejects.toThrow(
			new Error(
				stringTokenReplacement(ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL, [
					'missing personalisation parameters: ((first_name))'
				])
			)
		);
	});

	test('should throw the failed to send error when notifyClient.sendmail fails', async () => {
		notifySendData.notifyClient.sendEmail = jest.fn().mockRejectedValue(new Error('test error'));
		await expect(async () => await notifySend(notifySendData)).rejects.toThrow(
			new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL)
		);
	});

	test('should send a notification', async () => {
		await notifySend(notifySendData);

		expect(notifySendData.notifyClient.sendEmail).toHaveBeenCalledWith(
			{
				id: 'mock-appeal-generic-id'
			},
			'test@136s7.com',
			{ content: 'Content for Joe Bloggs', subject: 'Subject for Joe Bloggs' }
		);
	});
});
