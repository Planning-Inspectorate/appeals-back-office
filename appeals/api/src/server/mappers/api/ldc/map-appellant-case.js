/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

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
		siteUseAtTimeOfApplication: appellantCase?.siteUseAtTimeOfApplication,
		applicationMadeUnderActSection: appellantCase?.applicationMadeUnderActSection
	};
};
