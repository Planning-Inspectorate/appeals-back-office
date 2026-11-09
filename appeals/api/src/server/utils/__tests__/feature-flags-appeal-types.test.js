// @ts-nocheck
import config from '#config/config.js';
import { APPEAL_TYPE, GENERIC_APPEAL_TYPES } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import {
	filterEnabledAppealTypes,
	getEnabledAppealCaseTypes,
	getEnabledAppealTypes,
	isAppealEnabled,
	isAppealTypeEnabled
} from '../feature-flags-appeal-types.js';

describe('Feature flags appeal types (API)', () => {
	describe('isAppealTypeEnabled / isAppealCaseTypeEnabled', () => {
		test('Returns true for standard appeal case types', () => {
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.D)).toBe(true);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.W)).toBe(true);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.Y)).toBe(true);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.ZP)).toBe(true);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.ZA)).toBe(true);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.H)).toBe(true);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.C)).toBe(true);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.X)).toBe(true);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.F)).toBe(true);
		});

		test('Returns flag status for generic appeal case types', () => {
			const expected = Boolean(config.featureFlags.featureFlagGenericCase);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.G)).toBe(expected);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.L)).toBe(expected);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.Q)).toBe(expected);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.TPO)).toBe(expected);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.TRN)).toBe(expected);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.HH)).toBe(expected);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.HR)).toBe(expected);
			expect(isAppealTypeEnabled(APPEAL_CASE_TYPE.ENV)).toBe(expected);
		});

		test('Returns flag status for generic appeal type display names', () => {
			const expected = Boolean(config.featureFlags.featureFlagGenericCase);
			expect(isAppealTypeEnabled(GENERIC_APPEAL_TYPES.HIGH_HEDGES)).toBe(expected);
			expect(isAppealTypeEnabled(GENERIC_APPEAL_TYPES.HEDGEROWS)).toBe(expected);
			expect(isAppealTypeEnabled(GENERIC_APPEAL_TYPES.TREE_PRESERVATION_ORDER)).toBe(expected);
			expect(isAppealTypeEnabled(GENERIC_APPEAL_TYPES.TREE_REPLACEMENT_NOTICE)).toBe(expected);
			expect(isAppealTypeEnabled(GENERIC_APPEAL_TYPES.ENVIRONMENTAL)).toBe(expected);
			expect(isAppealTypeEnabled(GENERIC_APPEAL_TYPES.DISCONTINUANCE_NOTICE)).toBe(expected);
			expect(isAppealTypeEnabled(GENERIC_APPEAL_TYPES.COMMUNITY_INFRASTRUCTURE_LEVY)).toBe(
				expected
			);
			expect(isAppealTypeEnabled(GENERIC_APPEAL_TYPES.SECTION_106_AGREEMENT)).toBe(expected);
		});

		test('Returns false for unknown or falsy type', () => {
			expect(isAppealTypeEnabled('')).toBe(false);
			expect(isAppealTypeEnabled(null)).toBe(false);
			expect(isAppealTypeEnabled(undefined)).toBe(false);
			expect(isAppealTypeEnabled('unknown-type')).toBe(false);
		});
	});

	describe('getEnabledAppealTypes / getEnabledAppealCaseTypes', () => {
		test('returns array of enabled case types', () => {
			const types = getEnabledAppealTypes();
			expect(Array.isArray(types)).toBe(true);
			expect(types).toContain(APPEAL_CASE_TYPE.D);
			expect(types).toContain(APPEAL_CASE_TYPE.W);
			expect(getEnabledAppealCaseTypes()).toEqual(types);
		});
	});

	describe('filterEnabledAppealTypes', () => {
		test('filters appeal types list based on enabled keys and generic names', () => {
			const mockTypes = [
				{ id: 1, key: APPEAL_CASE_TYPE.D, type: APPEAL_TYPE.HOUSEHOLDER },
				{ id: 2, key: 'UNKNOWN', type: 'Unknown Type' },
				{ id: 3, key: APPEAL_CASE_TYPE.HH, type: APPEAL_TYPE.HIGH_HEDGES }
			];

			const filtered = filterEnabledAppealTypes(mockTypes);
			expect(filtered.some((t) => t.key === APPEAL_CASE_TYPE.D)).toBe(true);
			expect(filtered.some((t) => t.key === 'UNKNOWN')).toBe(false);
		});
	});

	describe('isAppealEnabled', () => {
		test('checks appeal based on appealType key', () => {
			expect(isAppealEnabled({ appealType: { key: APPEAL_CASE_TYPE.D } })).toBe(true);
			expect(isAppealEnabled({ appealType: { key: APPEAL_CASE_TYPE.HH } })).toBe(
				Boolean(config.featureFlags.featureFlagGenericCase)
			);
			expect(isAppealEnabled({ appealType: { key: 'INVALID' } })).toBe(false);
			expect(isAppealEnabled(null)).toBe(false);
		});
	});
});
