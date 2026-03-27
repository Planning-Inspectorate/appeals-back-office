import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import isAppellantStatementAppealType from '../is-appellant-statement-appeal-type.js';

describe('isAppellantStatementAppealType', () => {
	it.each([
		APPEAL_TYPE.ADVERTISEMENT,
		APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
		APPEAL_TYPE.ENFORCEMENT_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
	])('returns true for supported appeal type %s', (appealType) => {
		expect(isAppellantStatementAppealType(appealType)).toBe(true);
	});

	it.each([
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.S78,
		APPEAL_TYPE.PLANNED_LISTED_BUILDING,
		APPEAL_TYPE.CAS_PLANNING,
		APPEAL_TYPE.CAS_ADVERTISEMENT,
		APPEAL_TYPE.DISCONTINUANCE_NOTICE,
		'',
		null,
		undefined
	])('returns false for unsupported appeal type %s', (appealType) => {
		expect(isAppellantStatementAppealType(appealType)).toBe(false);
	});
});
