import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE
} from '@planning-inspectorate/data-model';
import { APPEAL_TYPE, PROCEDURE_TYPE_NAME } from '../../constants/common';
import {
	canChangeS78ExpeditedAppealProcedure,
	canChangeS78ExpeditedToTargetProcedure,
	displayFinalComments,
	displayPlanningObligation,
	sendSiteVisitScheduleUnaccompaniedNotify,
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

		it.each([APPEAL_CASE_PROCEDURE.WRITTEN_PART_1, 'Part 1'])(
			'returns false for writtenPart1 / Part 1 procedure: %s',
			(procedureType) => {
				expect(displayFinalComments(appealType, procedureType)).toBe(false);
			}
		);
	});
});

describe('displayPlanningObligation', () => {
	describe.each([APPEAL_TYPE.ENFORCEMENT_NOTICE, APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING])(
		'appeal type: %s',
		(appealType) => {
			it.each([
				APPEAL_CASE_PROCEDURE.WRITTEN,
				APPEAL_CASE_PROCEDURE.HEARING,
				APPEAL_CASE_PROCEDURE.INQUIRY
			])('returns true for %s when hasObligation = true', (procedureType) => {
				expect(displayPlanningObligation(appealType, procedureType, true)).toBe(true);
			});

			it.each([
				APPEAL_CASE_PROCEDURE.WRITTEN,
				APPEAL_CASE_PROCEDURE.HEARING,
				APPEAL_CASE_PROCEDURE.INQUIRY
			])('returns true for %s when hasObligation = false', (procedureType) => {
				expect(displayPlanningObligation(appealType, procedureType, false)).toBe(false);
			});
		}
	);

	describe.each([
		APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
		APPEAL_TYPE.DISCONTINUANCE_NOTICE,
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.S78,
		APPEAL_TYPE.ADVERTISEMENT,
		APPEAL_TYPE.PLANNED_LISTED_BUILDING,
		APPEAL_TYPE.CAS_PLANNING,
		APPEAL_TYPE.CAS_ADVERTISEMENT
	])('appeal type: %s', (appealType) => {
		it('returns false for written when hasObligation = true', () => {
			expect(displayPlanningObligation(appealType, APPEAL_CASE_PROCEDURE.WRITTEN, true)).toBe(
				false
			);
		});

		it('returns false for written when hasObligation = false', () => {
			expect(displayPlanningObligation(appealType, APPEAL_CASE_PROCEDURE.WRITTEN, false)).toBe(
				false
			);
		});

		it.each([APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY])(
			'returns true for %s when hasObligation = true',
			(procedureType) => {
				expect(displayPlanningObligation(appealType, procedureType, true)).toBe(true);
			}
		);

		it.each([APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY])(
			'returns false for %s when hasObligation = false',
			(procedureType) => {
				expect(displayPlanningObligation(appealType, procedureType, false)).toBe(false);
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

describe('sendSiteVisitScheduleUnaccompaniedNotify', () => {
	it.each([
		APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
		APPEAL_TYPE.ENFORCEMENT_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
	])('returns false for appeal type %s', (appealType) => {
		expect(sendSiteVisitScheduleUnaccompaniedNotify(appealType)).toBe(false);
	});

	it.each([
		APPEAL_TYPE.HOUSEHOLDER,
		APPEAL_TYPE.S78,
		APPEAL_TYPE.ADVERTISEMENT,
		APPEAL_TYPE.PLANNED_LISTED_BUILDING,
		APPEAL_TYPE.CAS_PLANNING,
		APPEAL_TYPE.CAS_ADVERTISEMENT,
		APPEAL_TYPE.DISCONTINUANCE_NOTICE
	])('returns true for appeal type %s', (appealType) => {
		expect(sendSiteVisitScheduleUnaccompaniedNotify(appealType)).toBe(true);
	});
});

describe('canChangeS78ExpeditedAppealProcedure', () => {
	it('returns false if isExpeditedCopFeatureActive is false', () => {
		expect(
			canChangeS78ExpeditedAppealProcedure({
				procedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				isExpeditedCopFeatureActive: false
			})
		).toBe(false);
	});

	it('returns false if isExpeditedCopFeatureActive is not provided', () => {
		expect(
			canChangeS78ExpeditedAppealProcedure({
				procedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
			})
		).toBe(false);
	});

	it('returns true when feature flag is active, procedure is Part 1, and stage is lpa_questionnaire', () => {
		expect(
			canChangeS78ExpeditedAppealProcedure({
				procedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				isExpeditedCopFeatureActive: true
			})
		).toBe(true);
	});

	it('returns false when stage is not lpa_questionnaire', () => {
		expect(
			canChangeS78ExpeditedAppealProcedure({
				procedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.EVENT,
				isExpeditedCopFeatureActive: true
			})
		).toBe(false);

		expect(
			canChangeS78ExpeditedAppealProcedure({
				procedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: undefined,
				isExpeditedCopFeatureActive: true
			})
		).toBe(false);
	});

	it.each([
		APPEAL_CASE_PROCEDURE.WRITTEN,
		APPEAL_CASE_PROCEDURE.HEARING,
		APPEAL_CASE_PROCEDURE.INQUIRY
	])('returns false when procedure is %s even if feature flag is active', (procedureType) => {
		expect(
			canChangeS78ExpeditedAppealProcedure({
				procedureType,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				isExpeditedCopFeatureActive: true
			})
		).toBe(false);
	});

	it('returns true when appealType is S78 and procedure is Part 1', () => {
		expect(
			canChangeS78ExpeditedAppealProcedure({
				appealType: APPEAL_TYPE.S78,
				procedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				isExpeditedCopFeatureActive: true
			})
		).toBe(true);
	});

	it('returns true when appealType is APPEAL_CASE_TYPE.W and procedure is Part 1', () => {
		expect(
			canChangeS78ExpeditedAppealProcedure({
				appealType: APPEAL_CASE_TYPE.W,
				procedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				isExpeditedCopFeatureActive: true
			})
		).toBe(true);
	});

	it('returns false when appealType is not S78', () => {
		expect(
			canChangeS78ExpeditedAppealProcedure({
				appealType: APPEAL_TYPE.HOUSEHOLDER,
				procedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				isExpeditedCopFeatureActive: true
			})
		).toBe(false);
	});
});

describe('canChangeS78ExpeditedToTargetProcedure', () => {
	it('returns false when isExpeditedCopFeatureActive is false', () => {
		expect(
			canChangeS78ExpeditedToTargetProcedure({
				targetProcedure: APPEAL_CASE_PROCEDURE.WRITTEN,
				appealType: APPEAL_TYPE.S78,
				currentProcedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				isExpeditedCopFeatureActive: false
			})
		).toBe(false);
	});

	it('returns true for Written at lpa_questionnaire stage when flag is active', () => {
		expect(
			canChangeS78ExpeditedToTargetProcedure({
				targetProcedure: APPEAL_CASE_PROCEDURE.WRITTEN,
				appealType: APPEAL_TYPE.S78,
				currentProcedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				isExpeditedCopFeatureActive: true
			})
		).toBe(true);
	});
	//add additional tests here when expanding avilable stages
	it('returns false for Written when stage is not lpa_questionnaire', () => {
		expect(
			canChangeS78ExpeditedToTargetProcedure({
				targetProcedure: APPEAL_CASE_PROCEDURE.WRITTEN,
				appealType: APPEAL_TYPE.S78,
				currentProcedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.READY_TO_START,
				isExpeditedCopFeatureActive: true
			})
		).toBe(false);
	});

	it('returns false for Written when past LPAQ stage (e.g. event)', () => {
		expect(
			canChangeS78ExpeditedToTargetProcedure({
				targetProcedure: APPEAL_CASE_PROCEDURE.WRITTEN,
				appealType: APPEAL_TYPE.S78,
				currentProcedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.EVENT,
				isExpeditedCopFeatureActive: true
			})
		).toBe(false);
	});
	//update when changing for hearing/inquiry
	it('returns false for Hearing and Inquiry for current stage', () => {
		expect(
			canChangeS78ExpeditedToTargetProcedure({
				targetProcedure: APPEAL_CASE_PROCEDURE.HEARING,
				appealType: APPEAL_TYPE.S78,
				currentProcedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				isExpeditedCopFeatureActive: true
			})
		).toBe(false);

		expect(
			canChangeS78ExpeditedToTargetProcedure({
				targetProcedure: APPEAL_CASE_PROCEDURE.INQUIRY,
				appealType: APPEAL_TYPE.S78,
				currentProcedureType: PROCEDURE_TYPE_NAME.WRITTEN_PART_1,
				currentStage: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				isExpeditedCopFeatureActive: true
			})
		).toBe(false);
	});
});
