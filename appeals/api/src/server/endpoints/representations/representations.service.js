import addressRepository from '#repositories/address.repository.js';
import * as documentRepository from '#repositories/document.repository.js';
import neighbouringSitesRepository from '#repositories/neighbouring-sites.repository.js';
import representationRepository from '#repositories/representation.repository.js';
import serviceUserRepository from '#repositories/service-user.repository.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateAddressRequest} UpdateAddressRequest */
/** @typedef {import('#db-client').Prisma.RepresentationUpdateInput} RepresentationUpdateInput */

export class RepresentationTypeError extends Error {
	/**
	 * @param {string} representationTypeValue
	 * */
	constructor(representationTypeValue) {
		super();

		this.message = `unrecognised Representation type: ${representationTypeValue}`;
	}
}

/**
 * @param {number} appealId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {{ representationType?: string[], status?: string }} [options]
 * */
export const getRepresentations = async (appealId, pageNumber = 1, pageSize = 30, options = {}) => {
	if (
		options.representationType &&
		!options.representationType.every((t) => Object.values(APPEAL_REPRESENTATION_TYPE).includes(t))
	) {
		throw new RepresentationTypeError(String(options.representationType));
	}

	return await representationRepository.getRepresentations(
		appealId,
		pageNumber - 1,
		pageSize,
		options
	);
};

/**
 * @param {number} appealId
 * @param {{ status?: string }} [options]
 * */
export const getRepresentationCounts = async (appealId, options = {}) => {
	return await representationRepository.getRepresentationCounts(appealId, options);
};

/**
 *
 * @param {number} id
 */
export const getRepresentation = representationRepository.getById;

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
 * @typedef {Object} CreateRepresentationInput
 * @param {'comment' | 'lpa_statement' | 'appellant_statement' | 'lpa_final_comment' | 'appellant_final_comment'} representationType
 * @property {{ firstName: string, lastName: string, email: string }} ipDetails
 * @property {{ addressLine1: string, addressLine2?: string, town: string, county?: string, postCode: string }} ipAddress
 * @property {string[]} attachments
 * @property {string} redactionStatus
 * @property {string} source
 *
 * @param {number} appealId
 * @param {CreateRepresentationInput} input
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 * */
export const createRepresentation = async (appealId, input) => {
	const { ipDetails, ipAddress } = input;

	const address =
		ipAddress &&
		(await addressRepository.createAddress({
			addressLine1: ipAddress.addressLine1,
			addressLine2: ipAddress.addressLine2,
			addressTown: ipAddress.town,
			addressCounty: ipAddress.county,
			postcode: ipAddress.postCode
		}));

	const represented = await serviceUserRepository.createServiceUser({
		firstName: ipDetails.firstName,
		lastName: ipDetails.lastName,
		email: ipDetails.email,
		addressId: address?.id
	});

	const representation = await representationRepository.createRepresentation({
		appealId,
		representedId: represented.id,
		representationType: input.representationType,
		source: input.source
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

/**
 * @param {number} repId
 * @param {string[]} attachments
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 */
export const updateAttachments = async (repId, attachments) => {
	const documents = await documentRepository.getDocumentsByIds(attachments);

	const mappedDocuments = documents.map((d) => ({
		documentGuid: d.guid,
		version: d.latestDocumentVersion?.version ?? 1
	}));

	const updatedRepresentation = await representationRepository.addAttachments(
		repId,
		mappedDocuments
	);
	return updatedRepresentation;
};

/**
 * @param {number} repId
 * @param {RepresentationUpdateInput} payload
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 * */
export async function updateRepresentation(repId, payload) {
	if (payload.rejectionReasons) {
		await representationRepository.updateRejectionReasons(repId, payload.rejectionReasons);
	}
	const updatedRep = await representationRepository.updateRepresentationById(repId, payload);

	if (!updatedRep.represented?.addressId) {
		return updatedRep;
	}

	if (!updatedRep.siteVisitRequested) {
		await neighbouringSitesRepository.disconnectSite(
			updatedRep.appealId,
			updatedRep.represented.addressId
		);
	} else if (
		[APPEAL_REPRESENTATION_STATUS.VALID, APPEAL_REPRESENTATION_STATUS.INVALID].includes(
			updatedRep.status
		)
	) {
		await neighbouringSitesRepository.connectSite(
			updatedRep.appealId,
			updatedRep.represented.addressId
		);
	}

	return updatedRep;
}
