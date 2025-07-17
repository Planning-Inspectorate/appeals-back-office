/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { isValidDevelopmentType } from '#utils/mapping/map-enums.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {AppellantCase|undefined}
 */
export const mapS20AppellantCase = (data) => {
	const {
		appeal: { appellantCase }
	} = data;

	return {
		appellantProcedurePreference: appellantCase?.appellantProcedurePreference,
		appellantProcedurePreferenceDetails: appellantCase?.appellantProcedurePreferenceDetails,
		appellantProcedurePreferenceDuration: appellantCase?.appellantProcedurePreferenceDuration,
		appellantProcedurePreferenceWitnessCount:
			appellantCase?.appellantProcedurePreferenceWitnessCount,
		planningObligation: {
			hasObligation: appellantCase?.planningObligation,
			status: appellantCase?.statusPlanningObligation
		},
		developmentType: isValidDevelopmentType(appellantCase?.developmentType)
			? appellantCase?.developmentType
			: null
	};
};
