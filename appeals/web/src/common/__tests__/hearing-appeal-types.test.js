import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

describe('getEnabledHearingAppealTypes', () => {
	it('should return an object', () => {
		const enabledAppealTypes = getEnabledHearingAppealTypes();
		expect(typeof enabledAppealTypes).toBe('object');
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
});
