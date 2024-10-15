import * as representationRepository from '#repositories/representation.repository.js';
import serviceUserRepository from '#repositories/service-user.repository.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateAddressRequest} UpdateAddressRequest */

/**
 *
 * @param {number} appealId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string|undefined} status // APPEAL_REPRESENTATION_STATUS
 * @returns {Promise<{ itemCount: number, comments: import('@pins/appeals.api').Schema.Representation[] }>}
 */
export const getThirdPartComments = async (
	appealId,
	pageNumber = 1,
	pageSize = 30,
	status = undefined
) => {
	const { itemCount, comments } = await representationRepository.getThirdPartyCommentsByAppealId(
		appealId,
		pageNumber - 1,
		pageSize,
		status
	);
	return { itemCount, comments };
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
    { status, notes, reviewer }
	);
	return rep;
};

/**
 *
 * @param {number} id
 * @param {string} redactedRepresentation
 * @param {string} reviewer
 */
export const redactRepresentation = (id, redactedRepresentation, reviewer) => representationRepository.updateRepresentationById(
  id,
  { redactedRepresentation, reviewer }
);

/**
 * @typedef {Object} CreateRepresentationInput
 * @property {'comment' | 'statement' | 'final_comment'} representationType
 * @property {{ firstName: string, lastName: string, email: string }} ipDetails
 * @property {UpdateAddressRequest} ipAddress
 * @property {string} attachmentId
 * @property {string} redactionStatus
 *
 * @param {number} appealId
 * @param {CreateRepresentationInput} input
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 * */
export const createRepresentation = async (appealId, input) => {
	const rep = await representationRepository.createRepresentation(
		appealId,
		input.representationType
	);

	return rep;
};
