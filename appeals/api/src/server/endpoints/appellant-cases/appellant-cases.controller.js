import * as CONSTANTS from '@pins/appeals/constants/support.js';
import appellantCaseRepository from '#repositories/appellant-case.repository.js';
import logger from '#utils/logger.js';
import { updateAppellantCaseValidationOutcome } from './appellant-cases.service.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { contextEnum } from '#mappers/context-enum.js';
import { appealDetailService } from '#endpoints/appeal-details/appeal-details.service.js';
import { renderAuditTrailDetail } from './appellant-cases.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppellantCaseById = async (req, res) => {
	const { appeal } = req;
	const dto = await appealDetailService.loadAndFormatAppeal({
		appeal,
		context: contextEnum.appellantCase
	});
	return res.send(dto);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateAppellantCaseById = async (req, res) => {
	const {
		appeal,
		body,
		body: {
			applicantFirstName,
			applicantSurname,
			areAllOwnersKnown,
			knowsOtherOwners,
			hasAdvertisedAppeal,
			hasAttemptedToIdentifyOwners,
			siteSafetyDetails,
			siteAccessDetails,
			ownsAllLand,
			ownsSomeLand,
			siteAreaSquareMetres,
			applicationDate,
			applicationDecisionDate,
			developmentDescription,
			isGreenBelt,
			applicationDecision,
			planningObligation,
			statusPlanningObligation,
			agriculturalHolding,
			tenantAgriculturalHolding,
			otherTenantsAgriculturalHolding,
			appellantCostsAppliedFor,
			appellantProcedurePreference,
			appellantProcedurePreferenceDetails,
			appellantProcedurePreferenceDuration,
			appellantProcedurePreferenceWitnessCount,
			developmentType,
			numberOfResidencesNetChange
		},
		params,
		validationOutcome
	} = req;

	const appellantCaseId = Number(params.appellantCaseId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	const { validAt, ...data } = body;
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';
	const notifyClient = req.notifyClient;

	try {
		validationOutcome
			? await updateAppellantCaseValidationOutcome(
					{
						appeal: {
							appealStatus: appeal.appealStatus,
							appealType: appeal.appealType,
							appellant: appeal.appellant,
							agent: appeal.agent,
							id: appeal.id,
							reference: appeal.reference,
							applicationReference: appeal.applicationReference || '',
							parentAppeals: appeal.parentAppeals,
							childAppeals: appeal.childAppeals
						},
						appellantCaseId,
						azureAdUserId,
						data,
						validationOutcome,
						validAt,
						siteAddress
					},
					notifyClient
			  )
			: await appellantCaseRepository.updateAppellantCaseById(appellantCaseId, {
					applicantFirstName,
					applicantSurname,
					areAllOwnersKnown,
					knowsOtherOwners,
					hasAdvertisedAppeal,
					siteSafetyDetails,
					siteAccessDetails,
					ownsAllLand,
					ownsSomeLand,
					siteAreaSquareMetres,
					applicationDate,
					applicationDecisionDate,
					isGreenBelt,
					changedDevelopmentDescription:
						typeof developmentDescription?.isChanged !== typeof undefined
							? developmentDescription?.isChanged
							: undefined,
					originalDevelopmentDescription:
						typeof developmentDescription?.details !== typeof undefined
							? developmentDescription?.details
							: undefined,
					applicationDecision,
					planningObligation,
					statusPlanningObligation,
					agriculturalHolding,
					tenantAgriculturalHolding,
					otherTenantsAgriculturalHolding,
					appellantCostsAppliedFor,
					appellantProcedurePreference,
					appellantProcedurePreferenceDetails,
					appellantProcedurePreferenceDuration,
					appellantProcedurePreferenceWitnessCount,
					developmentType,
					numberOfResidencesNetChange
			  });

		const auditTrailDetail = renderAuditTrailDetail(body);

		createAuditTrail({
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
				applicantFirstName,
				applicantSurname,
				areAllOwnersKnown,
				hasAdvertisedAppeal,
				hasAttemptedToIdentifyOwners,
				siteSafetyDetails,
				siteAccessDetails,
				ownsAllLand,
				ownsSomeLand,
				siteAreaSquareMetres,
				applicationDate,
				applicationDecisionDate,
				isGreenBelt,
				applicationDecision,
				appellantProcedurePreference,
				appellantProcedurePreferenceDetails,
				appellantProcedurePreferenceDuration,
				appellantProcedurePreferenceWitnessCount
		  };

	return res.send(response);
};

export { getAppellantCaseById, updateAppellantCaseById };
