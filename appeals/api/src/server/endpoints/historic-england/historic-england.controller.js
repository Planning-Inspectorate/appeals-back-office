import * as listedBuildingRepository from '#repositories/listed-buildings.repository.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const findListedBuilding = async (req, res) => {
	const { reference } = req.params;

	const result = await listedBuildingRepository.getListedBuilding(reference);
	if (!result) {
		return res.status(404).send();
	}
	return res.status(200).send(result);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const deleteListedBuilding = async (req, res) => {
	const { reference } = req.params;

	const result = await listedBuildingRepository.deleteListedBuilding(reference);
	if (!result) {
		return res.status(404).send();
	}
	return res.status(201).send(result);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const upsertListedBuilding = async (req, res) => {
	const { body } = req;

	const result = await listedBuildingRepository.upsertListedBuilding({
		reference: body['reference'],
		name: body['name'],
		grade: body['listedBuildingGrade']
	});

	if (!result) {
		return res.status(404).send();
	}
	return res.status(201).send(result);
};
