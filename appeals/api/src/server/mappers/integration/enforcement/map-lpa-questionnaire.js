import { mapLpaQuestionnaireSharedFields } from '../shared/s20s78/map-lpa-questionnaire.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealS78Case}
 */
export const mapLpaQuestionnaire = (data) => {
	return {
		...mapLpaQuestionnaireSharedFields(data)
	};
};
