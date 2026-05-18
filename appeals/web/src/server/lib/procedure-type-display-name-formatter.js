import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { PROCEDURE_TYPE_DISPLAY_NAME } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @param {"Written" | "Part 1" | "Hearing" | "Inquiry" | string} procedureTypeName
 * @returns string | null
 */
export function appealProcedureNameToLabelText(procedureTypeName) {
	switch (procedureTypeName) {
		case PROCEDURE_TYPE_DISPLAY_NAME.WRITTEN_PART_2:
			return 'Written representations (Part 2)';
		case PROCEDURE_TYPE_DISPLAY_NAME.WRITTEN_PART_1:
			return 'Written representations (Part 1)';
		case PROCEDURE_TYPE_DISPLAY_NAME.HEARING:
		case PROCEDURE_TYPE_DISPLAY_NAME.INQUIRY:
			return procedureTypeName;
		default:
			return null;
	}
}

/**
 * @param {string} procedureTypeKey
 * @returns string
 */
export function appealProcedureKeyToLabelText(procedureTypeKey) {
	switch (procedureTypeKey) {
		case APPEAL_CASE_PROCEDURE.WRITTEN:
			return 'Written representations (Part 2)';
		case APPEAL_CASE_PROCEDURE.WRITTEN_PART_1:
			return 'Written representations (Part 1)';
		case APPEAL_CASE_PROCEDURE.HEARING:
		case APPEAL_CASE_PROCEDURE.INQUIRY:
			return capitalizeFirstLetter(procedureTypeKey);
		default:
			return '';
	}
}
