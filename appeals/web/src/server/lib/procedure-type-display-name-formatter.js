import {
	PROCEDURE_TYPE_KEY,
	PROCEDURE_TYPE_LABEL,
	PROCEDURE_TYPE_NAME
} from '@pins/appeals/constants/common.js';
import { capitalizeFirstLetter } from '@pins/appeals/utils/string-case.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @param {string} procedureTypeName
 * @returns string | null
 */
export function appealProcedureNameToLabelText(procedureTypeName) {
	switch (procedureTypeName) {
		case PROCEDURE_TYPE_NAME.WRITTEN_PART_2:
			return 'Written representations (part 2)';
		case PROCEDURE_TYPE_NAME.WRITTEN_PART_1:
			return 'Written representations (part 1)';
		case PROCEDURE_TYPE_NAME.WRITTEN:
			return 'Written representations';
		case PROCEDURE_TYPE_NAME.HEARING:
		case PROCEDURE_TYPE_NAME.INQUIRY:
			return procedureTypeName;
		default:
			return null;
	}
}

/**
 * @param {string} procedureTypeKey
 * @param {Boolean} showPart2
 * @returns string
 */
export function appealProcedureKeyToLabelText(procedureTypeKey, showPart2) {
	switch (procedureTypeKey) {
		case APPEAL_CASE_PROCEDURE.WRITTEN:
			return showPart2 ? 'Written representations (part 2)' : 'Written representations';
		case APPEAL_CASE_PROCEDURE.WRITTEN_PART_2:
			return 'Written representations (part 2)';
		case APPEAL_CASE_PROCEDURE.WRITTEN_PART_1:
			return 'Written representations (part 1)';
		case APPEAL_CASE_PROCEDURE.HEARING:
		case APPEAL_CASE_PROCEDURE.INQUIRY:
			return capitalizeFirstLetter(procedureTypeKey);
		default:
			return '';
	}
}

const PROCEDURE_TYPE_LABEL_REPLACEMENTS = [
	[PROCEDURE_TYPE_NAME.WRITTEN_PART_1, PROCEDURE_TYPE_LABEL.WRITTEN_PART_1],
	[PROCEDURE_TYPE_KEY.WRITTEN_PART_1, PROCEDURE_TYPE_LABEL.WRITTEN_PART_1],
	[APPEAL_CASE_PROCEDURE.WRITTEN_PART_1, PROCEDURE_TYPE_LABEL.WRITTEN_PART_1],
	[PROCEDURE_TYPE_NAME.WRITTEN_PART_2, PROCEDURE_TYPE_LABEL.WRITTEN_PART_2],
	[PROCEDURE_TYPE_KEY.WRITTEN_PART_2, PROCEDURE_TYPE_LABEL.WRITTEN_PART_2],
	[APPEAL_CASE_PROCEDURE.WRITTEN_PART_2, PROCEDURE_TYPE_LABEL.WRITTEN_PART_2],
	[PROCEDURE_TYPE_NAME.WRITTEN, PROCEDURE_TYPE_LABEL.WRITTEN],
	[PROCEDURE_TYPE_KEY.WRITTEN, PROCEDURE_TYPE_LABEL.WRITTEN],
	[APPEAL_CASE_PROCEDURE.WRITTEN, PROCEDURE_TYPE_LABEL.WRITTEN]
];

/**
 * @param {string} detailsHtml
 * @returns string
 */
export const replaceProcedureTypeWithLabelInAuditText = (detailsHtml) => {
	const match = PROCEDURE_TYPE_LABEL_REPLACEMENTS.find(([search]) => detailsHtml.includes(search));
	return match ? detailsHtml.replace(match[0], match[1]) : detailsHtml;
};
