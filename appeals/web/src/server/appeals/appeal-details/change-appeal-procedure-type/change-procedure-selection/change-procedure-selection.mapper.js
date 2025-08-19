import featureFlags from '#common/feature-flags.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../appeal-details.types.js').Lpa} LPA
 */

/**
 * @param {string} appealReference
 * @param {string} backLinkUrl
 * @param {{appealProcedure: string}} [storedSessionData]
 * @param {string|undefined} errorMessage
 * @returns {PageContent}
 */
export const selectProcedurePage = (
	appealReference,
	backLinkUrl,
	storedSessionData,
	errorMessage = undefined
) => {
	const dataMappers = [
		{
			case: APPEAL_CASE_PROCEDURE.WRITTEN,
			featureFlag: FEATURE_FLAG_NAMES.SECTION_78
		},
		{
			case: APPEAL_CASE_PROCEDURE.HEARING,
			featureFlag: FEATURE_FLAG_NAMES.SECTION_78_HEARING
		},
		{
			case: APPEAL_CASE_PROCEDURE.INQUIRY,
			featureFlag: FEATURE_FLAG_NAMES.SECTION_78_INQUIRY
		}
	];

	/** @type {RadioItem[]} */
	const radioItems = [];

	dataMappers.map((item) => {
		if (featureFlags.isFeatureActive(item.featureFlag)) {
			radioItems.push({
				value: item.case,
				text: appealProcedureToLabelText(item.case),
				checked:
					storedSessionData?.appealProcedure && storedSessionData?.appealProcedure === item.case
			});
		}
	});

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
