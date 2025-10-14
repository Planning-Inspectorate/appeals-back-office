import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { contextEnum } from '#mappers/context-enum.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import logger from '#utils/logger.js';
import { updatePersonalList } from '#utils/update-personal-list.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import { appealDetailService } from './appeal-details.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppeal = async (req, res) => {
	const { appeal } = req;

	const result = await appealDetailService.loadAndFormatAppeal({
		appeal,
		context: /** @type {keyof contextEnum} */ (contextEnum.appealDetails)
	});

	if (!result) {
		return res.status(404).end();
	}

	return res.send(result);
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
			if (isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS) && appeal.childAppeals?.length) {
				await appealDetailService.assignUserForLinkedAppeals(
					appeal,
					{ caseOfficer, inspector },
					azureAdUserId
				);
			}
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

		await updatePersonalList(appealId);

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

	return res.send(response);
};

export const controller = {
	getAppeal,
	updateAppealById
};
