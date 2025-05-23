/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import {
	AUDIT_TRAIL_LISTED_BUILDING_ADDED,
	AUDIT_TRAIL_LISTED_BUILDING_UPDATED,
	AUDIT_TRAIL_LISTED_BUILDING_REMOVED,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import * as listedBuildingRepository from '#repositories/listed-buildings.repository.js';

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const addListedBuilding = async (req, res) => {
	const { appeal } = req;
	const { lpaQuestionnaireId, listEntry, affectsListedBuilding } = req.body;

	const result = await listedBuildingRepository.addListedBuilding(
		lpaQuestionnaireId,
		listEntry,
		affectsListedBuilding
	);

	if (result) {
		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId: req.get('azureAdUserId'),
			details: AUDIT_TRAIL_LISTED_BUILDING_ADDED
		});

		await broadcasters.broadcastAppeal(appeal.id);
	}

	return res.status(201).send({
		listedBuildingId: result.id,
		lpaQuestionnaireId: result.lpaQuestionnaireId,
		listEntry: result.listEntry,
		affectsListedBuilding: result.affectsListedBuilding
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const updateListedBuilding = async (req, res) => {
	const {
		appeal,
		params: { listedBuildingId }
	} = req;
	const { listEntry, affectsListedBuilding } = req.body;

	const result = await listedBuildingRepository.updateListedBuilding(
		listedBuildingId,
		listEntry,
		affectsListedBuilding
	);

	if (!result) {
		return res.status(404).send({ errors: { listedBuildingId: ERROR_NOT_FOUND } });
	}

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_LISTED_BUILDING_UPDATED
	});

	await broadcasters.broadcastAppeal(appeal.id);
	return res.send({
		listedBuildingId
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const removeListedBuilding = async (req, res) => {
	const { appeal } = req;
	const { listedBuildingId } = req.body;

	const result = await listedBuildingRepository.removeListedBuilding(listedBuildingId);

	if (!result) {
		return res.status(404).send({ errors: { listedBuildingId: ERROR_NOT_FOUND } });
	}

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_LISTED_BUILDING_REMOVED
	});

	await broadcasters.broadcastAppeal(appeal.id);
	return res.send({
		listedBuildingId
	});
};
