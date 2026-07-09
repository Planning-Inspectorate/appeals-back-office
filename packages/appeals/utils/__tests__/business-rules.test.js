import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '../../constants/common';
import { displayFinalComments } from '../business-rules.js';

describe('displayFinalComments', () => {
	describe.each([
		APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
		APPEAL_TYPE.DISCONTINUANCE_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
	])('appeal type: %s', (appealType) => {
		it.each([
			APPEAL_CASE_PROCEDURE.WRITTEN,
			APPEAL_CASE_PROCEDURE.HEARING,
			APPEAL_CASE_PROCEDURE.INQUIRY
		])('returns true for %s', (procedureType) => {
			expect(displayFinalComments(appealType, procedureType)).toBe(true);
		});
	});

	describe.each([
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.S78,
		APPEAL_TYPE.ADVERTISEMENT,
		APPEAL_TYPE.PLANNED_LISTED_BUILDING,
		APPEAL_TYPE.CAS_PLANNING,
		APPEAL_TYPE.CAS_ADVERTISEMENT
	])('appeal type: %s', (appealType) => {
		it('returns true for written', () => {
			expect(displayFinalComments(appealType, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(true);
		});

		it.each([APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY])(
			'returns false for %s',
			(procedureType) => {
				expect(displayFinalComments(appealType, procedureType)).toBe(false);
			}
		);
	});
});
