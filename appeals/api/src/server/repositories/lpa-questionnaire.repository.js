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
	/**
	 * @type {any[]}
	 */
	const transaction = [];

	transaction.push(
		databaseConnector.lPAQuestionnaire.update({
			where: { id },
			data: {
				lpaQuestionnaireValidationOutcomeId: data.validationOutcomeId,
				lpaStatement: data.lpaStatement,
				siteAccessDetails: data.siteAccessDetails,
				siteSafetyDetails: data.siteSafetyDetails,
				isGreenBelt: data.isGreenBelt,
				newConditionDetails: data.extraConditions,
				lpaCostsAppliedFor: data.lpaCostsAppliedFor,
				inConservationArea: data.isConservationArea,
				isCorrectAppealType: data.isCorrectAppealType,
				lpaNotificationMethods: processNotificationMethods(id, data, transaction),
				isAffectingNeighbouringSites: data.isAffectingNeighbouringSites,
				eiaColumnTwoThreshold: data.eiaColumnTwoThreshold,
				eiaRequiresEnvironmentalStatement: data.eiaRequiresEnvironmentalStatement,
				eiaEnvironmentalImpactSchedule: data.eiaEnvironmentalImpactSchedule,
				eiaDevelopmentDescription: data.eiaDevelopmentDescription,
				affectsScheduledMonument: data.affectsScheduledMonument,
				hasProtectedSpecies: data.hasProtectedSpecies,
				isAonbNationalLandscape: data.isAonbNationalLandscape,
				isGypsyOrTravellerSite: data.isGypsyOrTravellerSite,
				hasInfrastructureLevy: data.hasInfrastructureLevy,
				isInfrastructureLevyFormallyAdopted: data.isInfrastructureLevyFormallyAdopted,
				infrastructureLevyAdoptedDate: data.infrastructureLevyAdoptedDate,
				infrastructureLevyExpectedDate: data.infrastructureLevyExpectedDate,
				lpaProcedurePreference: data.lpaProcedurePreference,
				lpaProcedurePreferenceDetails: data.lpaProcedurePreferenceDetails,
				lpaProcedurePreferenceDuration: data.lpaProcedurePreferenceDuration,
				eiaSensitiveAreaDetails: data.eiaSensitiveAreaDetails,
				eiaConsultedBodiesDetails: data.eiaConsultedBodiesDetails,
				eiaScreeningRequired: data.eiaScreeningRequired,
				reasonForNeighbourVisits: data.reasonForNeighbourVisits
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

/**
 * @param {number} id
 * @param {UpdateLPAQuestionnaireRequest} data
 * @param {any[]} transaction
 * @returns {Object|undefined}
 */
function processNotificationMethods(id, data, transaction) {
	if (Array.isArray(data.lpaNotificationMethods)) {
		transaction.push(
			databaseConnector.lPANotificationMethodsSelected.deleteMany({
				where: { lpaQuestionnaireId: id }
			})
		);

		if (data.lpaNotificationMethods.length) {
			return {
				create: data.lpaNotificationMethods.map((/** @type {{ id: string }} */ method) => {
					return {
						lpaNotificationMethod: {
							connect: { id: parseInt(method.id, 10) }
						}
					};
				})
			};
		}
	}
}

export default { updateLPAQuestionnaireById };
