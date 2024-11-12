import * as CONSTANTS from '#endpoints/constants.js';
import { APPEAL_CASE_STAGE } from 'pins-data-model';
import { getFoldersForAppeal } from '#endpoints/documents/documents.service.js';
import { formatLpaQuestionnaire } from './lpa-questionnaires.formatter.js';
import { updateLPAQuestionnaireValidationOutcome } from './lpa-questionnaires.service.js';
import lpaQuestionnaireRepository from '#repositories/lpa-questionnaire.repository.js';
import logger from '#utils/logger.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { camelToScreamingSnake } from '#utils/string-utils.js';

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
	const folders = await getFoldersForAppeal(appeal.id, APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE);
	const formattedAppeal = formatLpaQuestionnaire(appeal, folders);
	return res.send(formattedAppeal);
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
			isAffectingNeighbouringSites,
			eiaColumnTwoThreshold,
			eiaRequiresEnvironmentalStatement,
			eiaEnvironmentalImpactSchedule,
			eiaDevelopmentDescription,
			affectsScheduledMonument,
			hasProtectedSpecies,
			isAonbNationalLandscape,
			isGypsyOrTravellerSite,
			isInfrastructureLevyFormallyAdopted,
			infrastructureLevyAdoptedDate,
			infrastructureLevyExpectedDate
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
					isAffectingNeighbouringSites,
					eiaColumnTwoThreshold,
					eiaRequiresEnvironmentalStatement,
					eiaEnvironmentalImpactSchedule,
					eiaDevelopmentDescription,
					affectsScheduledMonument,
					hasProtectedSpecies,
					isAonbNationalLandscape,
					isGypsyOrTravellerSite,
					isInfrastructureLevyFormallyAdopted,
					infrastructureLevyAdoptedDate,
					infrastructureLevyExpectedDate
			  });

		const updatedProperties = Object.keys(body).filter((key) => body[key] !== undefined);
		let auditTrailDetail = CONSTANTS.AUDIT_TRAIL_LPAQ_UPDATED;

		if (updatedProperties.length === 1) {
			const updatedProperty = updatedProperties[0];
			const constantKey = `AUDIT_TRAIL_LPAQ_${camelToScreamingSnake(updatedProperty)}_UPDATED`;
			// @ts-ignore
			auditTrailDetail = CONSTANTS[constantKey] || auditTrailDetail;
		}

		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId: req.get('azureAdUserId'),
			details: auditTrailDetail
		});

		await broadcasters.broadcastAppeal(appeal.id);
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
