import { getFoldersForAppeal } from '#endpoints/documents/documents.service.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '#endpoints/constants.js';
import { STAGE } from '@pins/appeals/constants/documents.js';
import appellantCaseRepository from '#repositories/appellant-case.repository.js';
import logger from '#utils/logger.js';
import { formatAppellantCase } from './appellant-cases.formatter.js';
import { updateAppellantCaseValidationOutcome } from './appellant-cases.service.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppellantCaseById = async (req, res) => {
	const { appeal } = req;
	const folders = await getFoldersForAppeal(appeal, STAGE.APPELLANTCASE);
	const formattedAppeal = formatAppellantCase(appeal, folders);

	return res.send(formattedAppeal);
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
			doesSiteRequireInspectorAccess,
			hasAdvertisedAppeal,
			hasAttemptedToIdentifyOwners,
			hasHealthAndSafetyIssues,
			healthAndSafetyIssues,
			inspectorAccessDetails,
			isSiteFullyOwned,
			isSitePartiallyOwned,
			isSiteVisibleFromPublicRoad,
			visibilityRestrictions
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
						appeal,
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
					doesSiteRequireInspectorAccess,
					hasAdvertisedAppeal,
					hasAttemptedToIdentifyOwners,
					hasHealthAndSafetyIssues,
					healthAndSafetyIssues,
					inspectorAccessDetails,
					isSiteFullyOwned,
					isSitePartiallyOwned,
					isSiteVisibleFromPublicRoad,
					visibilityRestrictions
			  });
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
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
				hasHealthAndSafetyIssues,
				healthAndSafetyIssues,
				isSiteFullyOwned,
				isSitePartiallyOwned,
				isSiteVisibleFromPublicRoad,
				visibilityRestrictions
		  };

	return res.send(response);
};

export { getAppellantCaseById, updateAppellantCaseById };
