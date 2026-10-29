// @ts-nocheck
import { jest } from '@jest/globals';

jest.unstable_mockModule('../redetermination.service.js', () => ({
	redetermineAppeal: jest.fn()
}));

const { postRedetermine } = await import('../redetermination.controller.js');
const { redetermineAppeal } = await import('../redetermination.service.js');

describe('redetermination controller', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('calls redetermineAppeal with appealId and azureAdUserId, returning 200 with result', async () => {
		const mockResult = { id: 1, currentStatus: 'event' };
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
});
