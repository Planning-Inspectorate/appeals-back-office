// @ts-nocheck
import { jest } from '@jest/globals';

jest.unstable_mockModule('../redetermination.service.js', () => ({
	redetermineAppeal: jest.fn(),
	progressRedetermination: jest.fn()
}));

const { postProgress, postRedetermine } = await import('../redetermination.controller.js');
const { progressRedetermination, redetermineAppeal } =
	await import('../redetermination.service.js');

describe('redetermination controller', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('calls redetermineAppeal with appealId and azureAdUserId, returning 200 with result', async () => {
		const mockResult = { id: 1, currentStatus: 'redetermination_stage_1' };
		redetermineAppeal.mockResolvedValue(mockResult);

		const req = {
			params: { appealId: '1' },
			get: jest.fn().mockReturnValue('test-azure-user-id')
		};
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn().mockReturnThis()
		};

		await postRedetermine(req, res);

		expect(redetermineAppeal).toHaveBeenCalledWith(1, 'test-azure-user-id');
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(mockResult);
	});

	it('calls progressRedetermination with appealId and azureAdUserId, returning 200 with result', async () => {
		const mockResult = { id: 1, currentStatus: 'redetermination_stage_2' };
		progressRedetermination.mockResolvedValue(mockResult);

		const req = {
			params: { appealId: '1' },
			get: jest.fn().mockReturnValue('test-azure-user-id')
		};
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn().mockReturnThis()
		};

		await postProgress(req, res);

		expect(progressRedetermination).toHaveBeenCalledWith(1, 'test-azure-user-id');
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(mockResult);
	});
});
