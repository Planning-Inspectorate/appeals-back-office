// @ts-nocheck
import { databaseConnector } from '#utils/database-connector.js';
import { jest } from '@jest/globals';
import appealStatusRepository from '../appeal-status.repository.js';

describe('appeal-status.repository', () => {
	let mockTx;

	beforeEach(() => {
		jest.clearAllMocks();

		mockTx = {
			appealStatus: {
				findFirst: jest.fn(),
				deleteMany: jest.fn(),
				update: jest.fn(),
				updateMany: jest.fn(),
				create: jest.fn()
			},
			appeal: {
				update: jest.fn()
			}
		};

		databaseConnector.$transaction = jest.fn().mockImplementation(async (arg) => {
			if (typeof arg === 'function') {
				return arg(mockTx);
			}
			return Promise.all(arg);
		});
	});

	describe('rollBackAppealStatusTo', () => {
		const appealId = 100;
		const baseCreatedAt = new Date('2025-01-01T10:00:00.000Z');
		const baseStatusRecord = {
			id: 1,
			appealId,
			status: 'lpa_questionnaire',
			createdAt: baseCreatedAt,
			valid: false
		};

		it('throws an error if fromStatus record is not found', async () => {
			mockTx.appealStatus.findFirst.mockResolvedValue(null);

			await expect(
				appealStatusRepository.rollBackAppealStatusTo(appealId, 'statements', 'lpa_questionnaire')
			).rejects.toThrow('Appeal status lpa_questionnaire not found for appeal 100');

			expect(mockTx.appealStatus.findFirst).toHaveBeenCalledWith({
				where: { appealId, status: 'lpa_questionnaire' }
			});
			expect(mockTx.appealStatus.deleteMany).not.toHaveBeenCalled();
			expect(mockTx.appeal.update).not.toHaveBeenCalled();
		});

		it('rolls back and reactivates existing record when fromStatus === targetStatus', async () => {
			const targetStatus = 'lpa_questionnaire';
			const fromStatus = 'lpa_questionnaire';

			mockTx.appealStatus.findFirst.mockResolvedValue(baseStatusRecord);
			mockTx.appealStatus.deleteMany.mockResolvedValue({ count: 2 });
			mockTx.appeal.update.mockResolvedValue({ id: appealId, currentStatus: targetStatus });
			mockTx.appealStatus.update.mockResolvedValue({
				...baseStatusRecord,
				valid: true
			});

			const result = await appealStatusRepository.rollBackAppealStatusTo(
				appealId,
				targetStatus,
				fromStatus
			);

			expect(mockTx.appealStatus.findFirst).toHaveBeenCalledWith({
				where: { appealId, status: fromStatus }
			});

			expect(mockTx.appealStatus.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: baseStatusRecord.appealId,
					createdAt: {
						gt: baseCreatedAt
					}
				}
			});

			expect(mockTx.appeal.update).toHaveBeenCalledWith({
				where: { id: baseStatusRecord.appealId },
				data: { currentStatus: targetStatus }
			});

			expect(mockTx.appealStatus.update).toHaveBeenCalledWith({
				where: { id: baseStatusRecord.id },
				data: { valid: true }
			});

			expect(mockTx.appealStatus.create).not.toHaveBeenCalled();
			expect(result).toEqual({
				...baseStatusRecord,
				valid: true
			});
		});

		it('rolls back and creates a new record when fromStatus !== targetStatus', async () => {
			const targetStatus = 'statements';
			const fromStatus = 'lpa_questionnaire';

			mockTx.appealStatus.findFirst.mockResolvedValue(baseStatusRecord);
			mockTx.appealStatus.deleteMany.mockResolvedValue({ count: 2 });
			mockTx.appeal.update.mockResolvedValue({ id: appealId, currentStatus: targetStatus });
			mockTx.appealStatus.create.mockResolvedValue({
				id: 2,
				appealId,
				status: targetStatus,
				valid: true,
				createdAt: new Date()
			});

			const result = await appealStatusRepository.rollBackAppealStatusTo(
				appealId,
				targetStatus,
				fromStatus
			);

			expect(mockTx.appealStatus.findFirst).toHaveBeenCalledWith({
				where: { appealId, status: fromStatus }
			});

			expect(mockTx.appealStatus.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: baseStatusRecord.appealId,
					createdAt: {
						gt: baseCreatedAt
					}
				}
			});

			expect(mockTx.appeal.update).toHaveBeenCalledWith({
				where: { id: baseStatusRecord.appealId },
				data: { currentStatus: targetStatus }
			});

			expect(mockTx.appealStatus.updateMany).toHaveBeenCalledWith({
				where: { appealId, valid: true },
				data: { valid: false }
			});

			expect(mockTx.appealStatus.create).toHaveBeenCalledWith({
				data: {
					appealId,
					createdAt: expect.any(Date),
					status: targetStatus,
					valid: true
				}
			});

			expect(mockTx.appealStatus.update).not.toHaveBeenCalled();
			expect(result).toEqual(
				expect.objectContaining({
					id: 2,
					appealId,
					status: targetStatus,
					valid: true
				})
			);
		});

		it('defaults fromStatus to targetStatus if fromStatus is not provided', async () => {
			const targetStatus = 'event';

			mockTx.appealStatus.findFirst.mockResolvedValue({
				...baseStatusRecord,
				status: targetStatus
			});
			mockTx.appealStatus.deleteMany.mockResolvedValue({ count: 1 });
			mockTx.appeal.update.mockResolvedValue({ id: appealId, currentStatus: targetStatus });
			mockTx.appealStatus.update.mockResolvedValue({
				...baseStatusRecord,
				status: targetStatus,
				valid: true
			});

			await appealStatusRepository.rollBackAppealStatusTo(appealId, targetStatus);

			expect(mockTx.appealStatus.findFirst).toHaveBeenCalledWith({
				where: { appealId, status: targetStatus }
			});
			expect(mockTx.appealStatus.update).toHaveBeenCalledWith({
				where: { id: baseStatusRecord.id },
				data: { valid: true }
			});
		});
	});
});
