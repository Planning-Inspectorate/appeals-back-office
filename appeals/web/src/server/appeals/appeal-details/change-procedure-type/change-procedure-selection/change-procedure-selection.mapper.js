import { getAvailableProcedureTypesForAppealType } from '#appeals/appeal-details/change-procedure-type/change-procedure-type.utils.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../appeal-details.types.js').Lpa} LPA
 */

/**
 * @param {string} appealReference
 * @param {string} appealType
 * @param {string} backLinkUrl
 * @param {string} appealProcedure
 * @param {string|undefined} errorMessage
 * @returns {PageContent}
 */
export const selectProcedurePage = (
	appealReference,
	appealType,
	backLinkUrl,
	appealProcedure,
	errorMessage = undefined
) => {
	const availableProcedureTypes = getAvailableProcedureTypesForAppealType(appealType);
	const sortedAvailableProcedureTypes = [
		APPEAL_CASE_PROCEDURE.WRITTEN,
		APPEAL_CASE_PROCEDURE.HEARING,
		APPEAL_CASE_PROCEDURE.INQUIRY
	].filter((procedureType) => availableProcedureTypes.includes(procedureType));

	/** @type {RadioItem[]} */
	const radioItems = sortedAvailableProcedureTypes.map((procedureType) => ({
		value: procedureType,
		text: appealProcedureToLabelText(procedureType),
		checked: appealProcedure && appealProcedure === procedureType
	}));

	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal procedure',
		backLinkUrl,
		preHeading: `Appeal ${appealShortReference(appealReference)} - update appeal procedure`,
		pageComponents: [
			radiosInput({
				name: 'appealProcedure',
				idPrefix: 'appeal-procedure',
				legendText: 'Appeal procedure',
				legendIsPageHeading: true,
				items: radioItems,
				errorMessage
			})
		]
	};

	return pageContent;
};

/**
 * @param {string} procedureType
 * @returns {string}
 */
function appealProcedureToLabelText(procedureType) {
	switch (procedureType) {
		case APPEAL_CASE_PROCEDURE.WRITTEN:
			return 'Written representations';
		case APPEAL_CASE_PROCEDURE.HEARING:
		case APPEAL_CASE_PROCEDURE.INQUIRY:
			return capitalizeFirstLetter(procedureType);
		default:
			return '';
	}
}
