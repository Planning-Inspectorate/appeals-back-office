import * as representationRepository from '#repositories/representation.repository.js';

/**
 *
 * @param {number} appealId
 * @param {string|undefined} status //APPEAL_REPRESENTATION_STATUS
 */
export const getThirdPartComments = async (
	appealId,
	pageNumber = 1,
	pageSize = 30,
	status = undefined
) => {
	const reps = await representationRepository.getThirdPartyCommentsByAppealId(
		appealId,
		pageNumber - 1,
		pageSize,
		status
	);
	return reps;
};

/**
 *
 * @param {number} appealId
 * @param {string|undefined} status //APPEAL_REPRESENTATION_STATUS
 */
export const getFinalComments = async (appealId, status = undefined) => {
	const data = await representationRepository.getFinalCommentsByAppealId(appealId);
	if (status) {
		return data.filter((rep) => rep.status === status);
	}

	return data;
};

/**
 *
 * @param {number} appealId
 * @param {string|undefined} status //APPEAL_REPRESENTATION_STATUS
 */
export const getStatements = async (appealId, status = undefined) => {
	const data = await representationRepository.getStatementsByAppealId(appealId);
	if (status) {
		return data.filter((rep) => rep.status === status);
	}

	return data;
};

/**
 *
 * @param {number} id
 */
export const getRepresentation = async (id) => await representationRepository.getById(id);

/**
 *
 * @param {number} appealId
 * @param {string} status //APPEAL_REPRESENTATION_STATUS
 */
export const addRepresentation = async (appealId, pageNumber = 0, pageSize = 30, status) => {
	const reps = await representationRepository.getThirdPartyCommentsByAppealId(
		appealId,
		pageNumber,
		pageSize,
		status
	);
	return reps;
};

/**
 *
 * @param {number} id
 * @param {string} status //APPEAL_REPRESENTATION_STATUS
 * @param {string} notes
 * @param {string} reviewer
 */
export const updateRepresentationStatus = async (id, status, notes, reviewer) => {
	const rep = await representationRepository.updateRepresentationById(
		id,
		undefined,
		status,
		notes,
		reviewer
	);
	return rep;
};

/**
 *
 * @param {number} id
 * @param {string} redactedRepresentation
 * @param {string} reviewer
 */
export const redactRepresentation = async (id, redactedRepresentation, reviewer) => {
	const rep = await representationRepository.updateRepresentationById(
		id,
		redactedRepresentation,
		undefined,
		undefined,
		reviewer
	);
	return rep;
};
