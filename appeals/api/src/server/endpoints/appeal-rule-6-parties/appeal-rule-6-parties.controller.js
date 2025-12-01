import logger from '#utils/logger.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import * as appealRule6PartiesService from './appeal-rule-6-parties.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getRule6Parties = async (req, res) => {
	const { appeal } = req;

	return res.send(appeal.appealRule6Parties);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const addRule6Party = async (req, res) => {
	const {
		body: { serviceUser },
		params
	} = req;

	const appealId = Number(params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	try {
		await appealRule6PartiesService.addRule6Party(appealId, serviceUser, azureAdUserId);
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	return res.status(201).send({ appealId, serviceUser });
};
