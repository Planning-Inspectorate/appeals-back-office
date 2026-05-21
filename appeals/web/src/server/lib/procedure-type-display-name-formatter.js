import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { PROCEDURE_TYPE_NAME } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @param {string} procedureTypeName
 * @returns string | null
 */
export function appealProcedureNameToLabelText(procedureTypeName) {
	switch (procedureTypeName) {
		case PROCEDURE_TYPE_NAME.WRITTEN_PART_2:
			return 'Written representations (Part 2)';
		case PROCEDURE_TYPE_NAME.WRITTEN_PART_1:
			return 'Written representations (Part 1)';
		case PROCEDURE_TYPE_NAME.HEARING:
		case PROCEDURE_TYPE_NAME.INQUIRY:
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
