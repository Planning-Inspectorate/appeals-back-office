// @ts-nocheck
import { databaseConnector } from '#utils/database-connector.js';
import { jest } from '@jest/globals';

// Setup mock modules for the repository functions called in createAppeal
const mockGetAppealTypeByTypeId = jest.fn();
jest.unstable_mockModule('../appeal-type.repository.js', () => ({
	getAppealTypeByTypeId: mockGetAppealTypeByTypeId
}));

const mockGetEnforcementTeamIdFromLpaCode = jest.fn();
const mockGetTeamIdFromLpaCode = jest.fn();
const mockGetTeamIdFromName = jest.fn();
jest.unstable_mockModule('../team.repository.js', () => ({
	getEnforcementTeamIdFromLpaCode: mockGetEnforcementTeamIdFromLpaCode,
	getTeamIdFromLpaCode: mockGetTeamIdFromLpaCode,
	getTeamIdFromName: mockGetTeamIdFromName
}));

// Now import the repository under test
const { createAppeal } = await import('../integrations.repository.js');

describe('integrations.repository - createAppeal', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const mockAppealData = {
		lpa: {
			connect: {
				lpaCode: 'E60000123'
			}
		},
		appealTypeId: 1
	};

	const setupPrismaMocks = (teamId) => {
		databaseConnector.appeal.create.mockResolvedValue({
			id: 42,
			appealTypeId: 1
		});

		databaseConnector.appeal.update.mockResolvedValue({
			id: 42,
			reference: 'APP/42',
			assignedTeamId: teamId
		});

		databaseConnector.appeal.findUnique.mockResolvedValue({
			id: 42,
			reference: 'APP/42',
			assignedTeamId: teamId
		});
	};

	describe('LDC or Discontinuance or Enforcement case types', () => {
		const enforcementCases = [
			['C', 'Enforcement Notice (C)'],
			['F', 'Enforcement Listed Building (F)'],
			['G', 'Discontinuance Notice (G)'],
			['X', 'Lawful Development Certificate (X)']
		];

		it.each(enforcementCases)(
			'assigns team using getEnforcementTeamIdFromLpaCode for case type %s (%s)',
			async (caseType) => {
				mockGetAppealTypeByTypeId.mockResolvedValue({ key: caseType });
				mockGetEnforcementTeamIdFromLpaCode.mockResolvedValue(10);
				setupPrismaMocks(10);

				const result = await createAppeal(mockAppealData, [], [], [], 'written');

				expect(mockGetEnforcementTeamIdFromLpaCode).toHaveBeenCalledWith('E60000123');
				expect(databaseConnector.appeal.update).toHaveBeenCalledWith(
					expect.objectContaining({
						data: expect.objectContaining({
							assignedTeamId: 10
						})
					})
				);
				expect(result.appeal.assignedTeamId).toBe(10);
			}
		);

		it.each(enforcementCases)(
			'falls back to getTeamIdFromLpaCode if getEnforcementTeamIdFromLpaCode returns null for case type %s (%s)',
			async (caseType) => {
				mockGetAppealTypeByTypeId.mockResolvedValue({ key: caseType });
				mockGetEnforcementTeamIdFromLpaCode.mockResolvedValue(null);
				mockGetTeamIdFromLpaCode.mockResolvedValue(20);
				setupPrismaMocks(20);

				const result = await createAppeal(mockAppealData, [], [], [], 'written');

				expect(mockGetEnforcementTeamIdFromLpaCode).toHaveBeenCalledWith('E60000123');
				expect(mockGetTeamIdFromLpaCode).toHaveBeenCalledWith('E60000123');
				expect(databaseConnector.appeal.update).toHaveBeenCalledWith(
					expect.objectContaining({
						data: expect.objectContaining({
							assignedTeamId: 20
						})
					})
				);
				expect(result.appeal.assignedTeamId).toBe(20);
			}
		);
	});
});
