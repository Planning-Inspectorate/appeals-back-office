/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { mapCasAdvertAppellantCase } from '../cas-advert/map-appellant-case.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {AppellantCase|undefined}
 */
export const mapAdvertAppellantCase = (data) => {
	const {
		appeal: { appellantCase }
	} = data;

	const sharedCasAdvertMappers = mapCasAdvertAppellantCase(data);

	return {
		...sharedCasAdvertMappers,
		appellantProcedurePreference: appellantCase?.appellantProcedurePreference,
		appellantProcedurePreferenceDetails: appellantCase?.appellantProcedurePreferenceDetails,
		appellantProcedurePreferenceDuration: appellantCase?.appellantProcedurePreferenceDuration,
		appellantProcedurePreferenceWitnessCount:
			appellantCase?.appellantProcedurePreferenceWitnessCount
	};
};
