// @ts-nocheck
import { getEnforcementReference } from '#utils/get-enforcement-reference.js';
import { jest } from '@jest/globals';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('getEnforcementReference', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns enforcementReference from appellantCase when already loaded', async () => {
		const appeal = {
			id: 1,
			appellantCase: { enforcementReference: 'ENF/2025/001' },
			appealType: { key: APPEAL_CASE_TYPE.C }
		};

		const result = await getEnforcementReference(appeal);

		expect(result).toBe('ENF/2025/001');
		expect(databaseConnector.appellantCase.findUnique).not.toHaveBeenCalled();
	});

	test('fetches enforcementReference from DB when appeal is type C but appellantCase not loaded', async () => {
		const appeal = {
			id: 42,
			appealType: { key: APPEAL_CASE_TYPE.C }
		};

		databaseConnector.appellantCase.findUnique.mockResolvedValue({
			enforcementReference: 'ENF/2025/002'
		});

		const result = await getEnforcementReference(appeal);

		expect(result).toBe('ENF/2025/002');
		expect(databaseConnector.appellantCase.findUnique).toHaveBeenCalledWith({
			where: { appealId: 42 }
		});
	});

	test('returns undefined when appeal is type C but no enforcementReference in DB', async () => {
		const appeal = {
			id: 42,
			appealType: { key: APPEAL_CASE_TYPE.C }
		};

		databaseConnector.appellantCase.findUnique.mockResolvedValue({
			enforcementReference: null
		});

		const result = await getEnforcementReference(appeal);

		expect(result).toBeUndefined();
	});

	test('returns undefined when appeal is type C and appellantCase not found in DB', async () => {
		const appeal = {
			id: 42,
			appealType: { key: APPEAL_CASE_TYPE.C }
		};

		databaseConnector.appellantCase.findUnique.mockResolvedValue(undefined);

		const result = await getEnforcementReference(appeal);

		expect(result).toBeUndefined();
	});

	test('returns undefined for non-enforcement appeal types', async () => {
		const appeal = {
			id: 1,
			appealType: { key: APPEAL_CASE_TYPE.D }
		};

		const result = await getEnforcementReference(appeal);

		expect(result).toBeUndefined();
		expect(databaseConnector.appellantCase.findUnique).not.toHaveBeenCalled();
	});

	test('returns undefined when appeal has no appealType', async () => {
		const appeal = { id: 1 };

		const result = await getEnforcementReference(appeal);

		expect(result).toBeUndefined();
		expect(databaseConnector.appellantCase.findUnique).not.toHaveBeenCalled();
	});

	test('prefers loaded appellantCase over DB fetch', async () => {
		const appeal = {
			id: 1,
			appellantCase: { enforcementReference: 'ENF/LOADED' },
			appealType: { key: APPEAL_CASE_TYPE.C }
		};

		const result = await getEnforcementReference(appeal);

		expect(result).toBe('ENF/LOADED');
		expect(databaseConnector.appellantCase.findUnique).not.toHaveBeenCalled();
	});
});
