// @ts-nocheck
import { jest } from '@jest/globals';
import { APPEAL_CASE_STATUS, APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

const mockTransitionState = jest.fn();

jest.unstable_mockModule('#state/transition-state.js', () => ({
	default: mockTransitionState
}));

const { updateAppealStatus } = await import('../appeal-status.controller.js');

describe('updateAppealStatus controller', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();

		req = {
			params: { appealId: '42' },
			body: { status: APPEAL_CASE_STATUS.STATEMENTS },
			get: jest.fn().mockReturnValue('user-azure-id-123'),
			appeal: {
				id: 42,
				appealType: { key: APPEAL_CASE_TYPE.TPO, type: 'Tree preservation order' }
			}
		};

		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis()
		};
	});

	test('returns 400 if appeal is not a generic appeal', async () => {
		req.appeal = {
			id: 42,
			appealType: { key: 'HAS', type: 'Householder' }
		};

		await updateAppealStatus(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: 'Manual status change only permitted for generic appeals'
		});
		expect(mockTransitionState).not.toHaveBeenCalled();
	});

	test('calls transitionState and returns 200 on success for generic appeal', async () => {
		mockTransitionState.mockResolvedValue(true);

		await updateAppealStatus(req, res);

		expect(mockTransitionState).toHaveBeenCalledWith(
			42,
			'user-azure-id-123',
			APPEAL_CASE_STATUS.STATEMENTS
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			status: APPEAL_CASE_STATUS.STATEMENTS
		});
	});
});
