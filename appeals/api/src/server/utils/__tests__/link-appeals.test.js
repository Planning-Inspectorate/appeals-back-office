// @ts-nocheck
import { jest } from '@jest/globals';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import {
	getChildAppeals,
	getChildEnforcementsWithGrounds,
	getLeadAppeal
} from '../link-appeals.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('link-appeals utils', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getChildAppeals', () => {
		it('should return empty array when appeal is undefined', () => {
			const result = getChildAppeals(undefined);
			expect(result).toEqual([]);
		});

		it('should return empty array when appeal has no childAppeals', () => {
			const appeal = { id: 1, reference: 'APP/123' };
			const result = getChildAppeals(appeal);
			expect(result).toEqual([]);
		});

		it('should return empty array when childAppeals is empty', () => {
			const appeal = {
				id: 1,
				reference: 'APP/123',
				childAppeals: []
			};
			const result = getChildAppeals(appeal);
			expect(result).toEqual([]);
		});

		it('should return only linked child appeals', () => {
			const childAppeal1 = { id: 2, reference: 'APP/124' };
			const childAppeal2 = { id: 3, reference: 'APP/125' };
			const childAppeal3 = { id: 4, reference: 'APP/126' };

			const appeal = {
				id: 1,
				reference: 'APP/123',
				childAppeals: [
					{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal1 },
					{ type: 'related', child: childAppeal2 },
					{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal3 }
				]
			};

			const result = getChildAppeals(appeal);
			expect(result).toEqual([childAppeal1, childAppeal3]);
		});

		it('should filter out child appeals without child object', () => {
			const childAppeal1 = { id: 2, reference: 'APP/124' };

			const appeal = {
				id: 1,
				reference: 'APP/123',
				childAppeals: [
					{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal1 },
					{ type: CASE_RELATIONSHIP_LINKED, child: null },
					{ type: CASE_RELATIONSHIP_LINKED, child: undefined }
				]
			};

			const result = getChildAppeals(appeal);
			expect(result).toEqual([childAppeal1]);
		});

		it('should return empty array when no linked relationships exist', () => {
			const appeal = {
				id: 1,
				reference: 'APP/123',
				childAppeals: [
					{ type: 'related', child: { id: 2, reference: 'APP/124' } },
					{ type: 'associated', child: { id: 3, reference: 'APP/125' } }
				]
			};

			const result = getChildAppeals(appeal);
			expect(result).toEqual([]);
		});
	});

	describe('getLeadAppeal', () => {
		it('should return undefined when appeal is undefined', () => {
			const result = getLeadAppeal(undefined);
			expect(result).toBeUndefined();
		});

		it('should return the appeal itself when it is a parent appeal', () => {
			const childAppeal = {
				id: 2,
				reference: 'APP/124',
				parentAppeals: [{ parent: { id: 1, reference: 'APP/123' } }]
			};
			const parentAppeal = {
				id: 1,
				reference: 'APP/123',
				childAppeals: [{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal }]
			};

			const result = getLeadAppeal(parentAppeal);
			expect(result).toBe(parentAppeal);
		});

		it('should return parent appeal when appeal is a child', () => {
			const parentAppeal = { id: 1, reference: 'APP/123' };
			const childAppeal = {
				id: 2,
				reference: 'APP/124',
				parentAppeals: [{ parent: parentAppeal }]
			};

			const result = getLeadAppeal(childAppeal);
			expect(result).toBe(parentAppeal);
		});

		it('should return undefined when appeal has no parent appeals', () => {
			const appeal = { id: 1, reference: 'APP/123', parentAppeals: [] };

			const result = getLeadAppeal(appeal);
			expect(result).toBeUndefined();
		});

		it('should return undefined when parentAppeals is undefined', () => {
			const appeal = { id: 1, reference: 'APP/123' };

			const result = getLeadAppeal(appeal);
			expect(result).toBeUndefined();
		});
	});

	describe('getChildEnforcementsWithGrounds', () => {
		it('should return empty array when appeal is undefined', async () => {
			const result = await getChildEnforcementsWithGrounds(undefined);
			expect(result).toEqual([]);
		});

		it('should return empty array when appeal is not enforcement type', async () => {
			const appeal = {
				id: 1,
				reference: '100000',
				appealType: { key: APPEAL_CASE_TYPE.D }
			};

			const result = await getChildEnforcementsWithGrounds(appeal);
			expect(result).toEqual([]);
		});

		it('should return empty array when enforcement appeal has no child appeals', async () => {
			const appeal = {
				id: 1,
				reference: '100000',
				appealType: { key: APPEAL_CASE_TYPE.C },
				childAppeals: []
			};

			const result = await getChildEnforcementsWithGrounds(appeal);
			expect(result).toEqual([]);
		});

		it('should return child enforcement appeals with grounds', async () => {
			const childAppeal1 = {
				id: 2,
				reference: '100001',
				appealType: { key: APPEAL_CASE_TYPE.C },
				appealGrounds: [{ ground: { groundRef: 'g' } }, { ground: { groundRef: 'a' } }]
			};
			const childAppeal2 = {
				id: 3,
				reference: '100002',
				appealType: { key: APPEAL_CASE_TYPE.C },
				appealGrounds: [{ ground: { groundRef: 'b' } }, { ground: { groundRef: 'f' } }]
			};

			databaseConnector.appeal.findUnique.mockResolvedValueOnce({
				...childAppeal1
			});

			databaseConnector.appeal.findUnique.mockResolvedValueOnce({
				...childAppeal2
			});

			const appeal = {
				id: 1,
				reference: '100000',
				appealType: { key: APPEAL_CASE_TYPE.C },
				childAppeals: [
					{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal1 },
					{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal2 }
				]
			};

			const result = await getChildEnforcementsWithGrounds(appeal);

			expect(result).toEqual([
				{
					reference: '100001',
					grounds: ['a', 'g'] // Sorted alphabetically
				},
				{
					reference: '100002',
					grounds: ['b', 'f'] // Sorted alphabetically
				}
			]);
		});

		it('should filter out non-enforcement child appeals', async () => {
			const enforcementChild = {
				id: 2,
				reference: '100001',
				appealType: { key: APPEAL_CASE_TYPE.C }
			};
			const householderChild = {
				id: 3,
				reference: '100002',
				appealType: { key: APPEAL_CASE_TYPE.D }
			};

			const appeal = {
				id: 1,
				reference: '100000',
				appealType: { key: APPEAL_CASE_TYPE.C },
				childAppeals: [
					{ type: CASE_RELATIONSHIP_LINKED, child: enforcementChild },
					{ type: CASE_RELATIONSHIP_LINKED, child: householderChild }
				]
			};

			const mockAppealWithGrounds = {
				id: 2,
				appealGrounds: [{ ground: { groundRef: 'A' } }]
			};

			databaseConnector.appeal.findUnique.mockResolvedValue({
				...mockAppealWithGrounds
			});

			const result = await getChildEnforcementsWithGrounds(appeal);

			expect(result).toEqual([
				{
					reference: '100001',
					grounds: ['A']
				}
			]);
		});

		it('should handle child appeals with no grounds', async () => {
			const childAppeal = {
				id: 2,
				reference: '100001',
				appealType: { key: APPEAL_CASE_TYPE.C }
			};

			const appeal = {
				id: 1,
				reference: '100000',
				appealType: { key: APPEAL_CASE_TYPE.C },
				childAppeals: [{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal }]
			};

			const mockAppealWithoutGrounds = {
				id: 2,
				appealGrounds: []
			};

			databaseConnector.appeal.findUnique.mockResolvedValue({
				...mockAppealWithoutGrounds
			});

			const result = await getChildEnforcementsWithGrounds(appeal);

			expect(result).toEqual([
				{
					reference: '100001',
					grounds: []
				}
			]);
		});

		it('should handle appeals with undefined appeal grounds', async () => {
			const childAppeal = {
				id: 2,
				reference: '100001',
				appealType: { key: APPEAL_CASE_TYPE.C }
			};

			const appeal = {
				id: 1,
				reference: '100000',
				appealType: { key: APPEAL_CASE_TYPE.C },
				childAppeals: [{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal }]
			};

			databaseConnector.appeal.findUnique.mockResolvedValue({
				...childAppeal
			});

			const result = await getChildEnforcementsWithGrounds(appeal);

			expect(result).toEqual([
				{
					reference: '100001',
					grounds: []
				}
			]);
		});

		it('should handle grounds with missing groundRef', async () => {
			const childAppeal = {
				id: 2,
				reference: '100001',
				appealType: { key: APPEAL_CASE_TYPE.C }
			};

			const appeal = {
				id: 1,
				reference: '100000',
				appealType: { key: APPEAL_CASE_TYPE.C },
				childAppeals: [{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal }]
			};

			const mockAppealWithIncompleteGrounds = {
				id: 2,
				appealGrounds: [
					{ ground: { groundRef: 'A' } },
					{ ground: { groundRef: null } },
					{ ground: null },
					{ ground: { groundRef: 'B' } }
				]
			};

			databaseConnector.appeal.findUnique.mockResolvedValue({
				...mockAppealWithIncompleteGrounds
			});

			const result = await getChildEnforcementsWithGrounds(appeal);

			expect(result).toEqual([
				{
					reference: '100001',
					grounds: ['', '', 'A', 'B'] // Empty strings for missing refs, sorted
				}
			]);
		});

		it('should sort results by reference number', async () => {
			const childAppeal1 = {
				id: 2,
				reference: '100002',
				appealType: { key: APPEAL_CASE_TYPE.C }
			};
			const childAppeal2 = {
				id: 3,
				reference: '100000',
				appealType: { key: APPEAL_CASE_TYPE.C }
			};
			const childAppeal3 = {
				id: 4,
				reference: '100001',
				appealType: { key: APPEAL_CASE_TYPE.C }
			};

			const appeal = {
				id: 1,
				reference: '100000',
				appealType: { key: APPEAL_CASE_TYPE.C },
				childAppeals: [
					{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal1 },
					{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal2 },
					{ type: CASE_RELATIONSHIP_LINKED, child: childAppeal3 }
				]
			};

			databaseConnector.appeal.findUnique.mockResolvedValue({
				...appeal,
				appealGrounds: []
			});

			const result = await getChildEnforcementsWithGrounds(appeal);

			expect(result).toEqual([
				{ reference: '100000', grounds: [] },
				{ reference: '100001', grounds: [] },
				{ reference: '100002', grounds: [] }
			]);
		});
	});
});
