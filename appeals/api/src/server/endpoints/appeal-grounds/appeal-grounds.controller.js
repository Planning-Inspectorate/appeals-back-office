import { updateAppealGround } from '#endpoints/appeal-grounds/appeal-grounds.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
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

	const filteredGroundsByAppealType = (await getAllGrounds()).filter(
		(ground) => ground.appealType === appeal.appealType?.type
	);

	const currentGroundsForAppeal = appeal?.appealGrounds?.map(({ ground }) => ground?.id) || [];

	const newlySelectedGrounds = new Set(groundsForAppeal.map(Number));
	const currentGrounds = new Set(currentGroundsForAppeal);

	const changes = filteredGroundsByAppealType
		.map(({ groundRef, id: groundId }) => {
			const isSelectedNow = newlySelectedGrounds.has(groundId);
			const wasSelectedBefore = currentGrounds.has(groundId);

			if (isSelectedNow && !wasSelectedBefore) {
				return { groundRef, groundId, appealId, isDeleted: false };
			}

			if (!isSelectedNow && wasSelectedBefore) {
				return { groundRef, groundId, appealId, isDeleted: true };
			}

			return null;
		})
		.filter(Boolean);

	try {
		response = await Promise.all(
			// @ts-ignore
			changes.map(({ groundRef, groundId, appealId, isDeleted }) =>
				updateAppealGround(azureAdUserId, { groundRef, groundId, appealId, isDeleted })
			)
		);

		await broadcasters.broadcastAppeal(appealId);
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
		const { groundId } =
			// @ts-ignore
			(groundRef && appeal.appealGrounds?.find(({ ground }) => ground.groundRef === groundRef)) ||
			{};

		const appealId = appeal.id;

		// @ts-ignore
		response = await updateAppealGround(azureAdUserId, {
			appealId,
			groundId,
			groundRef,
			// @ts-ignore
			factsForGround
		});

		await broadcasters.broadcastAppeal(appealId);
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
