import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { PROCEDURE_TYPE_NAME } from '../constants/common.js';
import {
	beforeExpeditedOriginalApplicationCutOff,
	isExpeditedAppealType
} from './appeal-type-checks.js';

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

/**
 * Determines the effective procedure type for an appeal, defaulting HAS/CAS appeals
 * submitted after the cutoff date to Written Part 1 if no explicit procedureType is provided.
 * @param {{ appealType?: { key?: string } | null, procedureType?: { key?: string } | null, appellantCase?: { applicationDate?: string | Date | null } | null }} appeal
 * @param {string | undefined} [procedureType]
 * @returns {string|undefined}
 */
export const getEffectiveProcedureType = (appeal, procedureType) => {
	if (procedureType) {
		return procedureType;
	}

	const rawAppDate = appeal.appellantCase?.applicationDate;
	const applicationDateStr = rawAppDate instanceof Date ? rawAppDate.toISOString() : rawAppDate;

	const isHasOrCasPart1 =
		isExpeditedAppealType(appeal.appealType?.key ?? null) &&
		Boolean(applicationDateStr) &&
		!beforeExpeditedOriginalApplicationCutOff(applicationDateStr);

	return isHasOrCasPart1
		? APPEAL_CASE_PROCEDURE.WRITTEN_PART_1
		: appeal.procedureType?.key || undefined;
};
