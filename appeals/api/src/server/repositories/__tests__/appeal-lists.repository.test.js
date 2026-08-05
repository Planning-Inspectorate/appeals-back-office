// @ts-nocheck
import { databaseConnector } from '#utils/database-connector.js';
import { jest } from '@jest/globals';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import appealListRepository from '../appeal-lists.repository.js';

describe('appeal-lists.repository', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('filters appeals by currentStatus', async () => {
		databaseConnector.appeal.findMany.mockResolvedValue([]);

		await appealListRepository.getAllAppeals(
			undefined,
			'validation',
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			false,
			undefined,
			undefined,
			undefined,
			undefined
		);

		expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					currentStatus: 'validation'
				})
			})
		);
		expect(databaseConnector.appeal.findMany.mock.calls[0][0].where.appealStatus).toBeUndefined();
	});

	it('forces currentStatus filtering when appellant procedure preference is applied', async () => {
		databaseConnector.appeal.findMany.mockResolvedValue([]);

		await appealListRepository.getAllAppeals(
			undefined,
			APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			false,
			undefined,
			undefined,
			undefined,
			'hearing'
		);

		const where = databaseConnector.appeal.findMany.mock.calls[0][0].where;

		expect(where.currentStatus).toEqual({
			in: ['ready_to_start', 'validation', 'assign_case_officer']
		});
		expect(where.appellantCase).toEqual({
			appellantProcedurePreference: 'hearing'
		});
	});
});
