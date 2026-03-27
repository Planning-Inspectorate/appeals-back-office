import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

describe('getEnabledHearingAppealTypes', () => {
	describe('when linked is false or not provided', () => {
		it('should return an array', () => {
			const enabledAppealTypes = getEnabledHearingAppealTypes();
			expect(Array.isArray(enabledAppealTypes)).toBe(true);
		});

		it('should have at least length one', () => {
			const enabledAppealTypes = getEnabledHearingAppealTypes();
			expect(enabledAppealTypes.length).toBeGreaterThanOrEqual(1);
		});

		it('should be all enabled appeal types when all flags are enabled', () => {
			const enabledAppealTypes = getEnabledHearingAppealTypes();
			expect(enabledAppealTypes).toEqual([
				APPEAL_TYPE.S78,
				APPEAL_TYPE.PLANNED_LISTED_BUILDING,
				APPEAL_TYPE.ENFORCEMENT_NOTICE,
				APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
				APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
			]);
		});

		it('should return the same result when explicitly passed false', () => {
			const enabledAppealTypes = getEnabledHearingAppealTypes(false);
			expect(enabledAppealTypes).toEqual([
				APPEAL_TYPE.S78,
				APPEAL_TYPE.PLANNED_LISTED_BUILDING,
				APPEAL_TYPE.ENFORCEMENT_NOTICE,
				APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
				APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
			]);
		});
	});

	describe('when linked is true', () => {
		it('should return an array', () => {
			const enabledAppealTypes = getEnabledHearingAppealTypes(true);
			expect(Array.isArray(enabledAppealTypes)).toBe(true);
		});

		it('should return only linked appeal types when all flags are enabled', () => {
			const enabledAppealTypes = getEnabledHearingAppealTypes(true);
			expect(enabledAppealTypes).toEqual([APPEAL_TYPE.ENFORCEMENT_NOTICE]);
		});
	});
});
