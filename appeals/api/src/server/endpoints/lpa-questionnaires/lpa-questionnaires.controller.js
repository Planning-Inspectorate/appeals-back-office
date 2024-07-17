import { ERROR_FAILED_TO_SAVE_DATA } from '#endpoints/constants.js';
import { APPEAL_CASE_STAGE } from 'pins-data-model';
import { getFoldersForAppeal } from '#endpoints/documents/documents.service.js';
import { formatLpaQuestionnaire } from './lpa-questionnaires.formatter.js';
import { updateLPAQuestionnaireValidationOutcome } from './lpa-questionnaires.service.js';
import lpaQuestionnaireRepository from '#repositories/lpa-questionnaire.repository.js';
import logger from '#utils/logger.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';

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
	const folders = await getFoldersForAppeal(appeal, APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE);
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
			siteWithinGreenBelt,
			extraConditions,
			lpaCostsAppliedFor,
			isConservationArea,
			isCorrectAppealType
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
					siteWithinGreenBelt,
					extraConditions,
					lpaCostsAppliedFor,
					isConservationArea,
					isCorrectAppealType
			  });

		await broadcasters.broadcastAppeal(appeal.id);
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
				lpaStatement,
				siteAccessDetails,
				siteSafetyDetails,
				siteWithinGreenBelt,
				extraConditions,
				lpaCostsAppliedFor,
				isConservationArea,
				isCorrectAppealType
		  };

	return res.send(response);
};

export { getLpaQuestionnaireById, updateLPAQuestionnaireById };
