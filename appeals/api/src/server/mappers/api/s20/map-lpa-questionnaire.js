/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaire */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { mapS78LpaQuestionnaire } from '../s78/map-lpa-questionnaire.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {LpaQuestionnaire|undefined}
 */
export const mapS20LpaQuestionnaire = (data) => {
	const {
		appeal: { lpaQuestionnaire }
	} = data;

	const sharedS78Mappers = mapS78LpaQuestionnaire(data);

	if (lpaQuestionnaire) {
		return {
			...sharedS78Mappers,
			preserveGrantLoan: lpaQuestionnaire.preserveGrantLoan
		};
	}
};
