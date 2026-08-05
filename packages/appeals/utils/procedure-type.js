import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { PROCEDURE_TYPE_NAME } from '../constants/common.js';

/**
 * Normalises a procedure type value to the canonical data-model key.
 * Handles both data-model keys (e.g. 'writtenPart1') and display names
 * (e.g. 'Part 1') that the API formatter sends to the web layer.
 * @param {string | undefined} procedureType
 * @returns {string | undefined}
 */
export const normaliseProcedureType = (procedureType) => {
	if (
		procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 ||
		procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_2 ||
		procedureType === PROCEDURE_TYPE_NAME.WRITTEN_PART_1 ||
		procedureType === PROCEDURE_TYPE_NAME.WRITTEN_PART_2
	) {
		return APPEAL_CASE_PROCEDURE.WRITTEN;
	}

	if (
		procedureType === APPEAL_CASE_PROCEDURE.HEARING ||
		procedureType === PROCEDURE_TYPE_NAME.HEARING
	) {
		return APPEAL_CASE_PROCEDURE.HEARING;
	}

	if (
		procedureType === APPEAL_CASE_PROCEDURE.INQUIRY ||
		procedureType === PROCEDURE_TYPE_NAME.INQUIRY
	) {
		return APPEAL_CASE_PROCEDURE.INQUIRY;
	}

	return procedureType;
};
