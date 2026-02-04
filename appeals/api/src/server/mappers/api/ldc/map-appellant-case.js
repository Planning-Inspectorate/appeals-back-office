/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/** @typedef  {"existing-development" | "proposed-changes-to-a-listed-building" | "proposed-use-of-a-development" | null | undefined} ApplicationMadeUnderActSection*/

/**
 *
 * @param {MappingRequest} data
 * @returns {AppellantCase|undefined}
 */
export const mapLdcAppellantCase = (data) => {
	const {
		appeal: { appellantCase }
	} = data;

	return {
		planningObligation: {
			hasObligation: appellantCase?.planningObligation,
			status: appellantCase?.statusPlanningObligation
		},
		siteUseAtTimeOfApplication: appellantCase?.siteUseAtTimeOfApplication,
		applicationMadeUnderActSection: /** @type {ApplicationMadeUnderActSection} */ (
			appellantCase?.applicationMadeUnderActSection
		)
	};
};
