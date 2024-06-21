import { databaseConnector } from '#utils/database-connector.js';
import appealTimetablesRepository from '#repositories/appeal-timetable.repository.js';
import commonRepository from './common.repository.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateLPAQuestionnaireRequest} UpdateLPAQuestionnaireRequest */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} id
 * @param {UpdateLPAQuestionnaireRequest} data
 * @returns {Promise<object>}
 */
const updateLPAQuestionnaireById = (id, data) => {
	const { appealId, incompleteReasons, timetable } = data;
	const transaction = [];

	transaction.push(
		databaseConnector.lPAQuestionnaire.update({
			where: { id },
			data: {
				lpaQuestionnaireValidationOutcomeId: data.validationOutcomeId,
				lpaStatement: data.lpaStatement,
				siteAccessDetails: data.inspectorAccessDetails,
				siteSafetyDetails: data.healthAndSafetyDetails,
				siteWithinGreenBelt: data.siteWithinGreenBelt,
				newConditionDetails: data.extraConditions,
				lpaCostsAppliedFor: data.lpaCostsAppliedFor,
				inConservationArea: data.isConservationArea,
				isCorrectAppealType: data.isCorrectAppealType
			}
		})
	);

	if (incompleteReasons) {
		transaction.push(
			...commonRepository.createIncompleteInvalidReasons({
				id,
				relationOne: 'lpaQuestionnaireId',
				relationTwo: 'lpaQuestionnaireIncompleteReasonId',
				manyToManyRelationTable: 'lPAQuestionnaireIncompleteReasonsSelected',
				incompleteInvalidReasonTextTable: 'lPAQuestionnaireIncompleteReasonText',
				data: incompleteReasons
			})
		);
	}

	if (appealId && timetable) {
		transaction.push(appealTimetablesRepository.upsertAppealTimetableById(appealId, timetable));
	}

	return databaseConnector.$transaction(transaction);
};

export default { updateLPAQuestionnaireById };
