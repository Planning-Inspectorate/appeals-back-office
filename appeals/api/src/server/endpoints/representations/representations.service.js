import addressRepository from '#repositories/address.repository.js';
import representationRepository from '#repositories/representation.repository.js';
import * as documentRepository from '#repositories/document.repository.js';
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
	const rep = await representationRepository.updateRepresentationById(id, {
		status,
		notes,
		reviewer
	});
	return rep;
};

/**
 *
 * @param {number} id
 * @param {string} redactedRepresentation
 * @param {string} reviewer
 */
export const redactRepresentation = (id, redactedRepresentation, reviewer) =>
	representationRepository.updateRepresentationById(id, { redactedRepresentation, reviewer });

/**
 * @typedef {Object} CreateRepresentationInput
 * @property {'comment' | 'statement' | 'final_comment'} representationType
 * @property {{ firstName: string, lastName: string, email: string }} ipDetails
 * @property {{ addressLine1: string, addressLine2?: string, town: string, county?: string, postCode: string }} ipAddress
 * @property {string[]} attachments
 * @property {string} redactionStatus
 *
 * @param {number} appealId
 * @param {CreateRepresentationInput} input
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 * */
export const createRepresentation = async (appealId, input) => {
	const { ipDetails, ipAddress } = input;

	const address = await addressRepository.createAddress({
		addressLine1: ipAddress.addressLine1,
		addressLine2: ipAddress.addressLine2,
		addressTown: ipAddress.town,
		addressCounty: ipAddress.county,
		postcode: ipAddress.postCode
	});

	const represented = await serviceUserRepository.createServiceUser({
		firstName: ipDetails.firstName,
		lastName: ipDetails.lastName,
		email: ipDetails.email,
		addressId: address.id
	});

	const representation = await representationRepository.createRepresentation({
		appealId,
		representedId: represented.id,
		representationType: input.representationType
	});

	if (input.attachments.length > 0) {
		const documents = await documentRepository.getDocumentsByIds(input.attachments);

		const mappedDocuments = documents.map((d) => ({
			documentGuid: d.guid,
			version: d.latestDocumentVersion?.version ?? 1
		}));

		await representationRepository.addAttachments(representation.id, mappedDocuments);
	}

	return representation;
};

/**
 * Updates rejection reasons for a representation.
 *
 * @param {number} representationId - The ID of the representation.
 * @param {Array<{ id: number, text: string[] }>} rejectionReasons
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation | null>}
 */
export const updateRejectionReasons = async (representationId, rejectionReasons) =>
	representationRepository.updateRejectionReasons(representationId, rejectionReasons);
