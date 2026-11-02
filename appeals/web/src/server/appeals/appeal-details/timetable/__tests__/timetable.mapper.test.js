// @ts-nocheck
import {
	APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1,
	APPEAL_CASE_STATUS_REDETERMINATION_STAGE_2
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { getAppealTimetableTypes, getIdText, getTimetableTypeText } from '../timetable.mapper.js';

describe('timetable.mapper', () => {
	const baseAppeal = {
		appealId: 1,
		appealType: 'Planning appeal',
		procedureType: APPEAL_CASE_PROCEDURE.WRITTEN,
		appealStatus: APPEAL_CASE_STATUS.STATEMENTS,
		documentationSummary: {
			lpaQuestionnaire: {
				status: 'received'
			}
		}
	};

	const baseAppellantCase = {
		planningObligation: {
			hasObligation: false
		}
	};

	describe('getAppealTimetableTypes', () => {
		it('should include statements and ip comments for APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1', () => {
			const appeal = {
				...baseAppeal,
				appealStatus: APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1
			};

			const timetableTypes = getAppealTimetableTypes(appeal, baseAppellantCase);
			expect(timetableTypes).toContain('lpaStatementDueDate');
			expect(timetableTypes).toContain('ipCommentsDueDate');
			expect(timetableTypes).toContain('finalCommentsDueDate');
			expect(timetableTypes).not.toContain('lpaQuestionnaireDueDate');
		});

		it('should include statements and ip comments for APPEAL_CASE_STATUS_REDETERMINATION_STAGE_2', () => {
			const appeal = {
				...baseAppeal,
				appealStatus: APPEAL_CASE_STATUS_REDETERMINATION_STAGE_2
			};

			const timetableTypes = getAppealTimetableTypes(appeal, baseAppellantCase);
			expect(timetableTypes).toContain('lpaStatementDueDate');
			expect(timetableTypes).toContain('ipCommentsDueDate');
			expect(timetableTypes).toContain('finalCommentsDueDate');
			expect(timetableTypes).not.toContain('lpaQuestionnaireDueDate');
		});

		it('should return inquiry specific due dates for inquiry procedure in redetermination stage 1', () => {
			const appeal = {
				...baseAppeal,
				appealStatus: APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1,
				procedureType: APPEAL_CASE_PROCEDURE.INQUIRY
			};

			const timetableTypes = getAppealTimetableTypes(appeal, baseAppellantCase);
			expect(timetableTypes).toContain('lpaStatementDueDate');
			expect(timetableTypes).toContain('ipCommentsDueDate');
			expect(timetableTypes).toContain('statementOfCommonGroundDueDate');
			expect(timetableTypes).toContain('proofOfEvidenceAndWitnessesDueDate');
			expect(timetableTypes).toContain('caseManagementConferenceDueDate');
		});
	});

	describe('getTimetableTypeText and getIdText', () => {
		it('should correctly map timetable types to display text and ids', () => {
			expect(getTimetableTypeText('lpaStatementDueDate')).toBe('Statements');
			expect(getIdText('lpaStatementDueDate')).toBe('lpa-statement');
			expect(getTimetableTypeText('ipCommentsDueDate')).toBe('Interested party comments');
			expect(getIdText('ipCommentsDueDate')).toBe('ip-comments');
			expect(getTimetableTypeText('finalCommentsDueDate')).toBe('Final comments');
			expect(getIdText('finalCommentsDueDate')).toBe('final-comments');
		});
	});
});
