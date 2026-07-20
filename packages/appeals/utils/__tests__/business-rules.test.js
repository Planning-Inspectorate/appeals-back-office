import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE
} from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '../../constants/common';
import {
	displayFinalComments,
	targetStateOnLpaqComplete,
	targetStateOnStatementsComplete
} from '../business-rules.js';

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

describe('targetStateOnLpaqComplete', () => {
	describe('appealTypeKey is APPEAL_CASE_TYPE.D (HAS)', () => {
		it('the target state should be EVENT when the site visit has not elapsed, no matter what procedureType we have', () => {
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.D, APPEAL_CASE_PROCEDURE.WRITTEN_PART_1, false)
			).toBe(APPEAL_CASE_STATUS.EVENT);
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.D, APPEAL_CASE_PROCEDURE.WRITTEN_PART_2, false)
			).toBe(APPEAL_CASE_STATUS.EVENT);
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.D, APPEAL_CASE_PROCEDURE.HEARING, false)
			).toBe(APPEAL_CASE_STATUS.EVENT);
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.D, APPEAL_CASE_PROCEDURE.INQUIRY, false)
			).toBe(APPEAL_CASE_STATUS.EVENT);
		});
		it('the target state should be ISSUE_DETERMINATION when the site visit has elapsed, no matter what procedureType we have', () => {
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.D, APPEAL_CASE_PROCEDURE.WRITTEN_PART_1, true)
			).toBe(APPEAL_CASE_STATUS.ISSUE_DETERMINATION);
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.D, APPEAL_CASE_PROCEDURE.WRITTEN_PART_2, true)
			).toBe(APPEAL_CASE_STATUS.ISSUE_DETERMINATION);
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.D, APPEAL_CASE_PROCEDURE.HEARING, true)
			).toBe(APPEAL_CASE_STATUS.ISSUE_DETERMINATION);
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.D, APPEAL_CASE_PROCEDURE.INQUIRY, true)
			).toBe(APPEAL_CASE_STATUS.ISSUE_DETERMINATION);
		});
	});

	describe('appealTypeKey is APPEAL_CASE_TYPE.W (S78)', () => {
		it('the target state should be EVENT when the site visit has not elapsed, when the procedureType is WRITTEN_PART_1', () => {
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.W, APPEAL_CASE_PROCEDURE.WRITTEN_PART_1, false)
			).toBe(APPEAL_CASE_STATUS.EVENT);
		});
		it('the target state should be ISSUE_DETERMINATION when the site visit has elapsed, when the procedureType is WRITTEN_PART_1', () => {
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.W, APPEAL_CASE_PROCEDURE.WRITTEN_PART_1, true)
			).toBe(APPEAL_CASE_STATUS.ISSUE_DETERMINATION);
		});

		it('the target state should be STATEMENTS when the site visit has not elapsed, when the procedureType is NOT WRITTEN_PART_1', () => {
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.W, APPEAL_CASE_PROCEDURE.WRITTEN_PART_2, false)
			).toBe(APPEAL_CASE_STATUS.STATEMENTS);
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.W, APPEAL_CASE_PROCEDURE.HEARING, false)
			).toBe(APPEAL_CASE_STATUS.STATEMENTS);
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.W, APPEAL_CASE_PROCEDURE.INQUIRY, false)
			).toBe(APPEAL_CASE_STATUS.STATEMENTS);
		});

		it('the target state should be STATEMENTS when the site visit has elapsed, when the procedureType is NOT WRITTEN_PART_1', () => {
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.W, APPEAL_CASE_PROCEDURE.WRITTEN_PART_2, true)
			).toBe(APPEAL_CASE_STATUS.STATEMENTS);
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.W, APPEAL_CASE_PROCEDURE.HEARING, true)
			).toBe(APPEAL_CASE_STATUS.STATEMENTS);
			expect(
				targetStateOnLpaqComplete(APPEAL_CASE_TYPE.W, APPEAL_CASE_PROCEDURE.INQUIRY, true)
			).toBe(APPEAL_CASE_STATUS.STATEMENTS);
		});
	});
});

describe('targetStateOnStatementsComplete', () => {
	describe('isLdcOrDiscontinuanceOrEnforcementCaseType is true', () => {
		it('the target state should be FINAL_COMMENTS when the procedureType is written', () => {
			expect(targetStateOnStatementsComplete(true, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
				APPEAL_CASE_STATUS.FINAL_COMMENTS
			);
		});
		it('the target state should be FINAL_COMMENTS when the procedureType is hearing', () => {
			expect(targetStateOnStatementsComplete(true, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
				APPEAL_CASE_STATUS.FINAL_COMMENTS
			);
		});

		it('the target state should be FINAL_COMMENTS when the procedureType is inquiry', () => {
			expect(targetStateOnStatementsComplete(true, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
				APPEAL_CASE_STATUS.FINAL_COMMENTS
			);
		});
	});

	describe('isLdcOrDiscontinuanceOrEnforcementCaseType is false', () => {
		it('the target state should be FINAL_COMMENTS when the procedureType is written', () => {
			expect(targetStateOnStatementsComplete(false, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
				APPEAL_CASE_STATUS.FINAL_COMMENTS
			);
		});
		it('the target state should be EVENT when the procedureType is hearing', () => {
			expect(targetStateOnStatementsComplete(false, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
				APPEAL_CASE_STATUS.EVENT
			);
		});

		it('the target state should be EVIDENCE when the procedureType is inquiry', () => {
			expect(targetStateOnStatementsComplete(false, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
				APPEAL_CASE_STATUS.EVIDENCE
			);
		});
	});
});
