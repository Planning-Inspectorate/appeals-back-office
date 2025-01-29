import { ERROR_FAILED_TO_SAVE_DATA } from '#endpoints/constants.js';
import logger from '#utils/logger.js';
import { appealDetailService } from './appeal-details.service.js';
import { contextEnum } from '#mappers/context-enum.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppeal = async (req, res) => {
	const { appeal } = req;

	const dto = await appealDetailService.loadAndFormatAppeal({
		appeal,
		context: contextEnum.appealDetails
	});

	return res.send(dto);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateAppealById = async (req, res) => {
	const {
		appeal,
		body: { caseOfficer, inspector, startedAt, validAt, planningApplicationReference, agent },
		params
	} = req;
	const appealId = Number(params.appealId);
	const azureAdUserId = req.get('azureAdUserId');

	try {
		if (appealDetailService.assignedUserType({ caseOfficer, inspector })) {
			await appealDetailService.assignUser(appeal, { caseOfficer, inspector }, azureAdUserId);
		} else {
			await appealDetailService.updateAppealDetails(
				{
					appealId,
					startedAt,
					validAt,
					planningApplicationReference,
					agent
				},
				azureAdUserId
			);
		}

		await broadcasters.broadcastAppeal(appeal.id);
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	const response = {
		...(caseOfficer !== undefined && { caseOfficer }),
		...(inspector !== undefined && { inspector }),
		...(startedAt !== undefined && { startedAt }),
		...(validAt !== undefined && { validAt }),
		...(planningApplicationReference !== undefined && { planningApplicationReference })
	};

	return res.status(200).send(response);
};

export const controller = {
	getAppeal,
	updateAppealById
};
