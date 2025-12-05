import { updateAppealGround } from '#endpoints/appeal-grounds/appeal-grounds.service.js';
import { getAllGrounds } from '#repositories/ground.repository.js';
import logger from '#utils/logger.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateGroundsForAppealByAppealId = async (req, res) => {
	const {
		appeal,
		body: { groundsForAppeal }
	} = req;

	const azureAdUserId = String(req.get('azureAdUserId'));
	const appealId = appeal.id;

	let response;

	const allGrounds = await getAllGrounds();

	const currentGroundsForAppeal =
		appeal?.appealGrounds?.map(({ ground }) => ground?.groundRef) || [];

	const changes = allGrounds
		.map(({ groundRef, id: groundId }) => {
			if (groundsForAppeal.includes(groundRef) && !currentGroundsForAppeal.includes(groundRef)) {
				return { groundRef, groundId, appealId, isDeleted: false };
			} else if (
				!groundsForAppeal.includes(groundRef) &&
				currentGroundsForAppeal.includes(groundRef)
			) {
				return { groundRef, groundId, appealId, isDeleted: true };
			}
			return null;
		})
		.filter((change) => change !== null);

	try {
		response = await Promise.all(
			changes.map(({ groundRef, groundId, appealId, isDeleted }) =>
				updateAppealGround(azureAdUserId, { groundRef, groundId, appealId, isDeleted })
			)
		);
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	return res.send(response);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateFactsForGroundByAppealIdAndGroundRef = async (req, res) => {
	const {
		appeal,
		body: { factsForGround },
		params: { groundRef }
	} = req;

	const azureAdUserId = String(req.get('azureAdUserId'));

	let response;

	try {
		const groundId =
			// @ts-ignore
			groundRef && appeal.appealGrounds?.find(({ ground }) => ground.groundRef === groundRef)?.id;

		const appealId = appeal.id;

		// @ts-ignore
		response = await updateAppealGround(azureAdUserId, {
			appealId,
			groundId,
			groundRef,
			// @ts-ignore
			factsForGround
		});
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	return res.send(response);
};

export const controller = {
	updateGroundsForAppealByAppealId,
	updateFactsForGroundByAppealIdAndGroundRef
};
