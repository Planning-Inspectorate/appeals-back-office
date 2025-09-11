import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import {
	appealCaseTypeToAppealTypeMapper,
	appealTypeToAppealCaseTypeMapper,
	getEnabledAppealCaseTypes,
	getEnabledAppealTypes,
	isAppealTypeEnabled
} from '../feature-flags-appeal-types.js';

describe('isAppealTypeEnabled', () => {
	it('Returns flag as a boolean', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.D);

		expect(typeof feature).toBe('boolean');
	});

	it('Returns false when no flag set in the .env file or in the config', () => {
		const feature = isAppealTypeEnabled('featureFlagBOAS2SomeFeatrue');
		expect(feature).toBe(false);
	});
});

describe('getEnabledAppealCaseTypes', () => {
	it('should return an object', () => {
		const enabledAppealTypes = getEnabledAppealCaseTypes();
		expect(typeof enabledAppealTypes).toBe('object');
	});

	it('should have at least length one', () => {
		const enabledAppealTypes = getEnabledAppealCaseTypes();
		expect(enabledAppealTypes.length).toBeGreaterThan(1);
	});
});

describe('getEnabledAppealTypes', () => {
	it('should return an object', () => {
		const enabledAppealTypes = getEnabledAppealTypes();
		expect(typeof enabledAppealTypes).toBe('object');
	});

	it('should have at least length one', () => {
		const enabledAppealTypes = getEnabledAppealTypes();
		expect(enabledAppealTypes.length).toBeGreaterThanOrEqual(1);
	});
});

describe('mappers', () => {
	test('appealTypeToAppealCaseTypeMapper should return an empty string for an invalid appeal type', () => {
		const testMap = appealTypeToAppealCaseTypeMapper('Not a valid appeal type');
		expect(testMap).toBe('');
	});

	test('appealCaseTypeToAppealTypeMapper should return an empty string for an invalid appeal type', () => {
		const testMap = appealCaseTypeToAppealTypeMapper('Not a valid case appeal type');
		expect(testMap).toBe('');
	});

	test('combining both mappers for a valid appeal type returns the same appeal type', () => {
		const appealType = APPEAL_TYPE.HOUSEHOLDER;
		const returnedAppealType = appealCaseTypeToAppealTypeMapper(
			appealTypeToAppealCaseTypeMapper(appealType)
		);
		expect(returnedAppealType).toBe(appealType);
	});
});
