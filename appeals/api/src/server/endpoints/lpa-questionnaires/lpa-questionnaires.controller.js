import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { appealDetailService } from '#endpoints/appeal-details/appeal-details.service.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { contextEnum } from '#mappers/context-enum.js';
import lpaQuestionnaireRepository from '#repositories/lpa-questionnaire.repository.js';
import { buildListOfLinkedAppeals } from '#utils/build-list-of-linked-appeals.js';
import { allLpaQuestionnaireOutcomesAreComplete } from '#utils/is-awaiting-linked-appeal.js';
import logger from '#utils/logger.js';
import { camelToScreamingSnake } from '#utils/string-utils.js';
import * as CONSTANTS from '@pins/appeals/constants/support.js';
import { updateLPAQuestionnaireValidationOutcome } from './lpa-questionnaires.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getLpaQuestionnaireById = async (req, res) => {
	const { appeal } = req;
	const dto = await appealDetailService.loadAndFormatAppeal({
		appeal,
		context: contextEnum.lpaQuestionnaire
	});
	return res.send(dto);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateLPAQuestionnaireById = async (req, res) => {
	const {
		appeal,
		body,
		body: {
			lpaStatement,
			siteAccessDetails,
			siteSafetyDetails,
			extraConditions,
			lpaCostsAppliedFor,
			isConservationArea,
			isCorrectAppealType,
			isGreenBelt,
			lpaNotificationMethods,
			eiaColumnTwoThreshold,
			eiaRequiresEnvironmentalStatement,
			eiaEnvironmentalImpactSchedule,
			eiaDevelopmentDescription,
			affectsScheduledMonument,
			hasProtectedSpecies,
			isAonbNationalLandscape,
			isGypsyOrTravellerSite,
			hasInfrastructureLevy,
			isInfrastructureLevyFormallyAdopted,
			infrastructureLevyAdoptedDate,
			infrastructureLevyExpectedDate,
			lpaProcedurePreference,
			lpaProcedurePreferenceDetails,
			lpaProcedurePreferenceDuration,
			eiaSensitiveAreaDetails,
			consultedBodiesDetails,
			reasonForNeighbourVisits,
			designatedSiteNames,
			preserveGrantLoan
		},
		params,
		validationOutcome
	} = req;
	const lpaQuestionnaireId = Number(params.lpaQuestionnaireId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';
	const notifyClient = req.notifyClient;

	try {
		validationOutcome
			? (body.lpaQuestionnaireDueDate = await updateLPAQuestionnaireValidationOutcome(
					{
						appeal,
						azureAdUserId,
						data: body,
						lpaQuestionnaireId,
						validationOutcome,
						siteAddress
					},
					notifyClient
			  ))
			: await lpaQuestionnaireRepository.updateLPAQuestionnaireById(lpaQuestionnaireId, {
					lpaStatement,
					siteAccessDetails,
					siteSafetyDetails,
					isGreenBelt,
					extraConditions,
					lpaCostsAppliedFor,
					isConservationArea,
					isCorrectAppealType,
					lpaNotificationMethods,
					eiaColumnTwoThreshold,
					eiaRequiresEnvironmentalStatement,
					eiaEnvironmentalImpactSchedule,
					eiaDevelopmentDescription,
					affectsScheduledMonument,
					hasProtectedSpecies,
					isAonbNationalLandscape,
					isGypsyOrTravellerSite,
					hasInfrastructureLevy,
					isInfrastructureLevyFormallyAdopted,
					infrastructureLevyAdoptedDate,
					infrastructureLevyExpectedDate,
					lpaProcedurePreference,
					lpaProcedurePreferenceDetails,
					lpaProcedurePreferenceDuration,
					eiaSensitiveAreaDetails,
					consultedBodiesDetails,
					reasonForNeighbourVisits,
					designatedSiteNames,
					preserveGrantLoan
			  });

		const updatedProperties = Object.keys(body).filter((key) => body[key] !== undefined);

		await Promise.all(
			updatedProperties.map((updatedProperty) =>
				createAuditTrail({
					appealId: appeal.id,
					azureAdUserId: req.get('azureAdUserId'),
					details:
						// @ts-ignore
						CONSTANTS[`AUDIT_TRAIL_LPAQ_${camelToScreamingSnake(updatedProperty)}_UPDATED`] ||
						CONSTANTS.AUDIT_TRAIL_LPAQ_UPDATED
				})
			)
		);

		await broadcasters.broadcastAppeal(appeal.id);

		const linkedAppeals = await buildListOfLinkedAppeals(appeal);
		if (allLpaQuestionnaireOutcomesAreComplete(linkedAppeals)) {
			// broadcast all linked appeals apart from the appeal already broadcast
			await Promise.all(
				linkedAppeals
					.filter((linkedAppeal) => linkedAppeal.id !== appeal.id)
					.map((linkedAppeal) => broadcasters.broadcastAppeal(linkedAppeal.id))
			);
		}
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: CONSTANTS.ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	const response = validationOutcome
		? {
				validationOutcome
		  }
		: {
				lpaStatement,
				siteAccessDetails,
				siteSafetyDetails,
				isGreenBelt,
				extraConditions,
				lpaCostsAppliedFor,
				isConservationArea,
				isCorrectAppealType,
				affectsScheduledMonument,
				hasProtectedSpecies,
				isAonbNationalLandscape,
				isGypsyOrTravellerSite
		  };

	return res.send(response);
};

export { getLpaQuestionnaireById, updateLPAQuestionnaireById };
