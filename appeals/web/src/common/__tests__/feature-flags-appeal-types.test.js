import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import {
	getEnabledAppealCaseTypes,
	getEnabledAppealTypes,
	isAppealTypeEnabled
} from '../feature-flags-appeal-types.js';

describe('isAppealTypeEnabled', () => {
	it('Returns flag as a boolean', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.D);

		expect(typeof feature).toBe('boolean');
	});

	it('Returns flag as a boolean for Enforcement (C)', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.C);

		expect(typeof feature).toBe('boolean');
	});

	it('Returns flag as a boolean for Enforcement Listed Building (F)', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.F);

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
