import { jest } from '@jest/globals';
import notify from '../notify-send.js';

const { notifySend, emailRequestCache } = notify;

describe('Deduplication Operation Proof', () => {
	const originalEnv = process.env.NODE_ENV;

	beforeAll(() => {
		jest.useFakeTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
		process.env.NODE_ENV = originalEnv;
	});

	beforeEach(() => {
		emailRequestCache.clear();
		process.env.NODE_ENV = 'production';
	});

	test('should block duplicate email within 2 second window', async () => {
		// @ts-ignore
		const mockNotifyClient = { sendEmail: jest.fn().mockResolvedValue({}) };

		const data = {
			templateName: 'appeal-confirmed',
			recipientEmail: 'test@example.com',
			personalisation: { appeal_reference_number: '123' },
			notifyClient: mockNotifyClient
		};
		try {
			await notifySend(data);
		} catch (e) {
			/* ignore render error */
		}
		try {
			await notifySend(data);
		} catch (e) {
			/* ignore render error */
		}

		expect(emailRequestCache.size).toBe(1);
	});

	test('should allow email after 2 second window expires', async () => {
		// @ts-ignore
		const mockNotifyClient = { sendEmail: jest.fn().mockResolvedValue({}) };
		const data = {
			templateName: 'appeal-confirmed',
			recipientEmail: 'test@example.com',
			personalisation: { appeal_reference_number: '123' },
			notifyClient: mockNotifyClient
		};

		try {
			await notifySend(data);
		} catch (e) {
			/* ignore */
		}

		jest.advanceTimersByTime(2100);

		try {
			await notifySend(data);
		} catch (e) {
			/* ignore */
		}

		expect(emailRequestCache.size).toBe(1);
	});

	test('should NOT block if the recipient is different', async () => {
		// @ts-ignore
		const mockNotifyClient = { sendEmail: jest.fn().mockResolvedValue({}) };
		const baseData = {
			templateName: 'appeal-confirmed',
			personalisation: { appeal_reference_number: '123' },
			notifyClient: mockNotifyClient
		};

		try {
			await notifySend({ ...baseData, recipientEmail: 'user-a@example.com' });
		} catch (e) {
			/* ignore */
		}
		try {
			await notifySend({ ...baseData, recipientEmail: 'user-b@example.com' });
		} catch (e) {
			/* ignore */
		}

		expect(emailRequestCache.size).toBe(2);
	});

	test('should NOT block if the template is different', async () => {
		// @ts-ignore
		const mockNotifyClient = { sendEmail: jest.fn().mockResolvedValue({}) };
		const baseData = {
			recipientEmail: 'test@example.com',
			personalisation: { appeal_reference_number: '123' },
			notifyClient: mockNotifyClient
		};

		try {
			await notifySend({ ...baseData, templateName: 'template-receipt' });
		} catch (e) {
			/* ignore */
		}
		try {
			await notifySend({ ...baseData, templateName: 'template-decision' });
		} catch (e) {
			/* ignore */
		}

		expect(emailRequestCache.size).toBe(2);
	});
});
