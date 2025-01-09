import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import addressRepository from '#repositories/address.repository.js';
import representationRepository from '#repositories/representation.repository.js';
import * as documentRepository from '#repositories/document.repository.js';
import serviceUserRepository from '#repositories/service-user.repository.js';
import config from '#config/config.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL, FRONT_OFFICE_URL } from '#endpoints/constants.js';
import { addDays } from '#utils/business-days.js';
import formatDate from '#utils/date-formatter.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateAddressRequest} UpdateAddressRequest */

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
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {Appeal} appeal
 * @param {Representation} comment
 * @param {boolean} allowResubmit
 * */
export const notifyRejection = async (notifyClient, appeal, comment, allowResubmit) => {
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	const reasons =
		comment.representationRejectionReasonsSelected?.map((selectedReason) => {
			if (selectedReason.representationRejectionReason.hasText) {
				const reasonText =
					selectedReason.representationRejectionReasonText
						?.map((reason) => reason.text)
						.filter((text) => typeof text === 'string' && text.trim() !== '')
						.join(', ') || 'No details provided';
				return `Other: ${reasonText}`;
			}
			return selectedReason.representationRejectionReason.name;
		}) ?? [];

	const extendedDeadline = await (async () => {
		if (!allowResubmit) {
			return null;
		}

		const date = await addDays(new Date().toISOString(), 7);
		return formatDate(date, false);
	})();

	const emailVariables = {
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		url: FRONT_OFFICE_URL,
		reasons,
		deadline_date: extendedDeadline ?? ''
	};

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	if (!recipientEmail) {
		throw new Error(`no recipient email address found for Appeal: ${appeal.reference}`);
	}

	const templateId = extendedDeadline
		? config.govNotify.template.commentRejectedDeadlineExtended
		: config.govNotify.template.commentRejected;

	try {
		await notifyClient.sendEmail(templateId, recipientEmail, emailVariables);
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
	}
};

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
