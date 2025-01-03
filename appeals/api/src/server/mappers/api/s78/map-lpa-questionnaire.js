/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaire */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/**
 *
 * @param {MappingRequest} data
 * @returns {LpaQuestionnaire|undefined}
 */
export const mapLpaQuestionnaire = (data) => {
	const {
		appeal: { lpaQuestionnaire }
	} = data;

	return {
		lpaProcedurePreference: lpaQuestionnaire?.lpaProcedurePreference
	};
};
