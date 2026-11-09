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

	it('Returns flag as a boolean for Discontinuance Notice (G)', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.G);

		expect(typeof feature).toBe('boolean');
	});

	it('Returns flag as a boolean for Community Infrastructure Levy (L)', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.L);

		expect(typeof feature).toBe('boolean');
	});

	it('Returns flag as a boolean for Planning Obligation (Q)', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.Q);

		expect(typeof feature).toBe('boolean');
	});

	it('Returns flag as a boolean for Tree Preservation Order (TPO)', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.TPO);

		expect(typeof feature).toBe('boolean');
	});

	it('Returns flag as a boolean for Tree Replacement Notice (TRN)', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.TRN);

		expect(typeof feature).toBe('boolean');
	});

	it('Returns flag as a boolean for High Hedges (HH)', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.HH);

		expect(typeof feature).toBe('boolean');
	});

	it('Returns flag as a boolean for Hedgerows (HR)', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.HR);

		expect(typeof feature).toBe('boolean');
	});

	it('Returns flag as a boolean for Environmental (ENV)', () => {
		const feature = isAppealTypeEnabled(APPEAL_CASE_TYPE.ENV);

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
