/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { mapLpaQuestionnaireSharedFields } from '#mappers/integration/shared/s20s78/map-lpa-questionnaire.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealS78Case}
 */
export const mapLpaQuestionnaire = (data) => {
	const { appeal } = data;

	const casedata = appeal.lpaQuestionnaire;

	return {
		...mapLpaQuestionnaireSharedFields(data),
		// @ts-ignore
		appealUnderActSection: casedata?.appealUnderActSection ?? null,
		lpaConsiderAppealInvalid: casedata?.lpaConsiderAppealInvalid ?? null,
		lpaAppealInvalidReasons: casedata?.lpaAppealInvalidReasons ?? null
	};
};
