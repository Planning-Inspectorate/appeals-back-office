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
	const { appealId, designatedSites, incompleteReasons, timetable } = data;
	const transaction = [];

	transaction.push(
		databaseConnector.lPAQuestionnaire.update({
			where: { id },
			data: {
				doesAffectAListedBuilding: data.doesAffectAListedBuilding,
				doesAffectAScheduledMonument: data.doesAffectAScheduledMonument,
				doesSiteRequireInspectorAccess: data.doesSiteRequireInspectorAccess,
				doesSiteHaveHealthAndSafetyIssues: data.doesSiteHaveHealthAndSafetyIssues,
				healthAndSafetyDetails: data.healthAndSafetyDetails,
				hasCompletedAnEnvironmentalStatement: data.hasCompletedAnEnvironmentalStatement,
				hasProtectedSpecies: data.hasProtectedSpecies,
				hasTreePreservationOrder: data.hasTreePreservationOrder,
				includesScreeningOption: data.includesScreeningOption,
				inspectorAccessDetails: data.inspectorAccessDetails,
				isConservationArea: data.isConservationArea,
				isCorrectAppealType: data.isCorrectAppealType,
				isEnvironmentalStatementRequired: data.isEnvironmentalStatementRequired,
				isAffectingNeighbouringSites: data.isAffectingNeighbouringSites,
				isGypsyOrTravellerSite: data.isGypsyOrTravellerSite,
				isListedBuilding: data.isListedBuilding,
				isPublicRightOfWay: data.isPublicRightOfWay,
				isSensitiveArea: data.isSensitiveArea,
				isTheSiteWithinAnAONB: data.isTheSiteWithinAnAONB,
				lpaQuestionnaireValidationOutcomeId: data.validationOutcomeId,
				meetsOrExceedsThresholdOrCriteriaInColumn2: data.meetsOrExceedsThresholdOrCriteriaInColumn2,
				scheduleTypeId: data.scheduleTypeId,
				sensitiveAreaDetails: data.sensitiveAreaDetails
			}
		})
	);

	if (designatedSites) {
		transaction.push(
			...commonRepository.updateManyToManyRelationTable({
				id,
				data: designatedSites,
				databaseTable: 'designatedSitesOnLPAQuestionnaires',
				relationOne: 'lpaQuestionnaireId',
				relationTwo: 'designatedSiteId'
			})
		);
	}

	if (incompleteReasons) {
		transaction.push(
			...commonRepository.createIncompleteInvalidReasons({
				id,
				relationOne: 'lpaQuestionnaireId',
				relationTwo: 'lpaQuestionnaireIncompleteReasonId',
				manyToManyRelationTable: 'lPAQuestionnaireIncompleteReasonOnLPAQuestionnaire',
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
