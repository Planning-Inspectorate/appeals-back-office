import config from '#config/config.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import addressRepository from '#repositories/address.repository.js';
import * as documentRepository from '#repositories/document.repository.js';
import neighbouringSitesRepository from '#repositories/neighbouring-sites.repository.js';
import representationRepository from '#repositories/representation.repository.js';
import serviceUserRepository from '#repositories/service-user.repository.js';
import transitionState, { transitionLinkedChildAppealsState } from '#state/transition-state.js';
import BackOfficeAppError from '#utils/app-error.js';
import { isCurrentStatus } from '#utils/current-status.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import logger from '#utils/logger.js';
import { camelToScreamingSnake } from '#utils/string-utils.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE,
	FEATURE_FLAG_NAMES
} from '@pins/appeals/constants/common.js';
import * as CONSTANTS from '@pins/appeals/constants/support.js';
import {
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL,
	VALIDATION_OUTCOME_COMPLETE
} from '@pins/appeals/constants/support.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { EventType } from '@pins/event-client';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateAddressRequest} UpdateAddressRequest */
/** @typedef {import('#db-client').Prisma.RepresentationUpdateInput} RepresentationUpdateInput */

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
		throw new BackOfficeAppError(
			`unrecognised Representation type: ${options?.representationType}`,
			400
		);
	}

	return await representationRepository.getRepresentations(
		appealId,
		options,
		pageNumber - 1,
		pageSize
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
 * @param {number} id
 */
export const getRepresentation = representationRepository.getById;

/**
 *
 * @param {string} status
 * @param {string} repType
 * @param {Boolean} redactedRep
 * @returns String
 */
export const getRepStatusAuditLogDetails = (status, repType, redactedRep) => {
	let auditText;
	const auditTitle = 'AUDIT_TRAIL_REP_';
	const valid = '_STATUS_VALID';
	const invalid = '_STATUS_INVALID';
	const incomplete = '_STATUS_INCOMPLETE';
	const redactedAccepted = '_STATUS_REDACTED_AND_ACCEPTED';

	if (status === APPEAL_REPRESENTATION_STATUS.VALID && redactedRep === true) {
		auditText = auditTitle + camelToScreamingSnake(repType) + redactedAccepted;
	} else if (status === APPEAL_REPRESENTATION_STATUS.VALID) {
		auditText = auditTitle + camelToScreamingSnake(repType) + valid;
	} else if (status === APPEAL_REPRESENTATION_STATUS.INVALID) {
		auditText = auditTitle + camelToScreamingSnake(repType) + invalid;
	} else if (status === APPEAL_REPRESENTATION_STATUS.INCOMPLETE) {
		auditText = auditTitle + camelToScreamingSnake(repType) + incomplete;
	}
	// @ts-ignore
	return CONSTANTS[auditText];
};

/** @typedef {Awaited<ReturnType<getRepresentation>>} DBRepresentation */

/**
 * @typedef {Object} CreateRepresentationInput
 * @property {'comment' | 'lpa_statement' | 'appellant_statement' | 'lpa_final_comment' | 'appellant_final_comment'} representationType
 * @property {{ firstName: string, lastName: string, email: string }} ipDetails
 * @property {{ addressLine1: string, addressLine2?: string, town: string, county?: string, postCode: string }} ipAddress
 * @property {string[]} attachments
 * @property {string | undefined} dateCreated
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
		ipAddress?.addressLine1 &&
		ipAddress?.postCode &&
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
		addressId: address ? address.id : undefined
	});

	const representation = await representationRepository.createRepresentation({
		appealId,
		representedId: represented.id,
		representationType: input.representationType,
		source: input.source,
		dateCreated: input.dateCreated
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
 * @param {import('express').Request['body']} payload
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

/** @typedef {Awaited<ReturnType<updateRepresentation>>} UpdatedDBRepresentation */

/** @typedef {(appeal: Appeal, azureAdUserId: string, notifyClient: import('#endpoints/appeals.js').NotifyClient) => Promise<Representation[]>} PublishFunction */

/**
 * Also publishes any valid IP comments at the same time.
 *
 * @type {PublishFunction}
 * */
export async function publishLpaStatements(appeal, azureAdUserId, notifyClient) {
	if (!isCurrentStatus(appeal, APPEAL_CASE_STATUS.STATEMENTS)) {
		throw new BackOfficeAppError('appeal in incorrect state to publish LPA statement', 409);
	}

	const documentsUpdated = await documentRepository.setRedactionStatusOnValidation(appeal.id);
	for (const documentUpdated of documentsUpdated) {
		await broadcasters.broadcastDocument(
			documentUpdated.documentGuid,
			documentUpdated.version,
			EventType.Update
		);
	}

	const result = await representationRepository.updateRepresentations(
		appeal.id,
		{
			OR: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
					status: {
						in: [APPEAL_REPRESENTATION_STATUS.VALID, APPEAL_REPRESENTATION_STATUS.INCOMPLETE]
					}
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.COMMENT,
					status: APPEAL_REPRESENTATION_STATUS.VALID
				}
			]
		},
		{
			status: APPEAL_REPRESENTATION_STATUS.PUBLISHED
		}
	);

	await transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);

	if (isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
		await transitionLinkedChildAppealsState(appeal, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
	}

	const finalCommentsDueDate = formatDate(
		new Date(appeal.appealTimetable?.finalCommentsDueDate || ''),
		false
	);

	const hasLpaStatement = result.some(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
	);
	const hasIpComments = result.some(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.COMMENT
	);

	try {
		let whatHappensNextAppellant;
		let whatHappensNextLpa;
		let lpaSubject;
		let appellantSubject;
		if (String(appeal.procedureType?.key) === APPEAL_CASE_PROCEDURE.HEARING) {
			lpaSubject = `We've received all statements and comments`;
			appellantSubject = `We have received the local planning authority's questionnaire, all statements and comments from interested parties`;
			if (appeal.hearing?.hearingStartTime) {
				whatHappensNextAppellant = `Your hearing is on ${formatDate(
					appeal.hearing?.hearingStartTime,
					false
				)}.\n\nWe will contact you if we need any more information.`;
				whatHappensNextLpa = `The hearing is on ${formatDate(
					appeal.hearing?.hearingStartTime,
					false
				)}.`;
			} else {
				whatHappensNextAppellant = `We will contact you if we need any more information.`;
				whatHappensNextLpa = `We will contact you when the hearing has been set up.`;
			}
		} else {
			lpaSubject = 'Submit your final comments';
			appellantSubject = 'Submit your final comments';
			whatHappensNextAppellant = `You need to [submit your final comments](${config.frontOffice.url}/appeals/${appeal.reference}) by ${finalCommentsDueDate}.`;
			whatHappensNextLpa = `You need to [submit your final comments](${config.frontOffice.url}/manage-appeals/${appeal.reference}) by ${finalCommentsDueDate}.`;
		}

		await notifyPublished({
			appeal,
			notifyClient,
			hasLpaStatement,
			hasIpComments,
			templateName: 'received-statement-and-ip-comments-lpa',
			recipientEmail: appeal.lpa?.email,
			finalCommentsDueDate,
			whatHappensNext: whatHappensNextLpa,
			subject: lpaSubject,
			azureAdUserId
		});

		await notifyPublished({
			appeal,
			notifyClient,
			hasLpaStatement,
			hasIpComments,
			templateName: 'received-statement-and-ip-comments-appellant',
			recipientEmail: appeal.agent?.email || appeal.appellant?.email,
			finalCommentsDueDate,
			whatHappensNext: whatHappensNextAppellant,
			subject: appellantSubject,
			azureAdUserId
		});
	} catch (error) {
		logger.error(error);
	}

	return result;
}

/** @type {PublishFunction} */
export async function publishFinalComments(appeal, azureAdUserId, notifyClient) {
	if (!isCurrentStatus(appeal, APPEAL_CASE_STATUS.FINAL_COMMENTS)) {
		throw new BackOfficeAppError('appeal in incorrect state to publish final comments', 409);
	}

	const documentsUpdated = await documentRepository.setRedactionStatusOnValidation(appeal.id);
	for (const documentUpdated of documentsUpdated) {
		await broadcasters.broadcastDocument(
			documentUpdated.documentGuid,
			documentUpdated.version,
			EventType.Update
		);
	}

	const result = await representationRepository.updateRepresentations(
		appeal.id,
		{
			representationType: APPEAL_REPRESENTATION_TYPE.FINAL_COMMENT,
			status: APPEAL_REPRESENTATION_STATUS.VALID
		},
		{
			status: APPEAL_REPRESENTATION_STATUS.PUBLISHED
		}
	);

	await transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);

	if (isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
		await transitionLinkedChildAppealsState(appeal, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
	}

	try {
		const hasLpaFinalComment = result.some(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
		);
		const hasAppellantFinalComment = result.some(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
		);

		if (hasLpaFinalComment) {
			await notifyAppellantAboutLpaFinalComments(appeal, notifyClient, azureAdUserId);
		} else {
			await notifyNoFinalComments(appeal, notifyClient, azureAdUserId, 'local planning authority');
		}

		if (hasAppellantFinalComment) {
			await notifyLpaAboutAppellantFinalComments(appeal, notifyClient, azureAdUserId);
		} else {
			await notifyNoFinalComments(appeal, notifyClient, azureAdUserId, 'appellant');
		}
	} catch (error) {
		logger.error(error);
	}

	return result;
}

/**
 * @typedef {object} NotifyPublished
 * @property {Appeal} appeal
 * @property {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @property {string} templateName
 * @property {string | null} [recipientEmail]
 * @property {string} [finalCommentsDueDate]
 * @property {string} [whatHappensNext]
 * @property {boolean} [hasLpaStatement]
 * @property {boolean} [hasIpComments]
 * @property {string} [subject]
 * @property {string} [userTypeNoCommentSubmitted]
 * @property {string} azureAdUserId
 */

/**
 * @param {NotifyPublished} options
 * @returns {Promise<void>}
 */
async function notifyPublished({
	appeal,
	notifyClient,
	templateName,
	recipientEmail,
	finalCommentsDueDate = '',
	whatHappensNext = '',
	hasLpaStatement = false,
	hasIpComments = false,
	subject = '',
	userTypeNoCommentSubmitted = '',
	azureAdUserId
}) {
	const lpaReference = appeal.applicationReference;
	if (!lpaReference) {
		throw new Error(
			`${ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL}: no applicationReference in appeal`
		);
	}
	if (!recipientEmail) {
		throw new Error(
			`${ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL}: missing recipient email address for template ${templateName}`
		);
	}

	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	await notifySend({
		azureAdUserId,
		notifyClient,
		templateName,
		recipientEmail,
		personalisation: {
			appeal_reference_number: appeal.reference,
			site_address: siteAddress,
			lpa_reference: lpaReference,
			final_comments_deadline: finalCommentsDueDate,
			what_happens_next: whatHappensNext,
			has_ip_comments: hasIpComments,
			has_statement: hasLpaStatement,
			...(subject ? { subject } : {}),
			user_type: userTypeNoCommentSubmitted
		}
	});
}

/**
 * @param {Appeal} appeal
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * */
function notifyLpaAboutAppellantFinalComments(appeal, notifyClient, azureAdUserId) {
	const recipientEmail = appeal.lpa?.email;
	if (!recipientEmail) {
		throw new Error(`${ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL}: no LPA email address in appeal`);
	}

	return notifyPublished({
		appeal,
		notifyClient,
		templateName: 'final-comments-done-lpa',
		recipientEmail,
		azureAdUserId
	});
}

/**
 * @param {Appeal} appeal
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * */
function notifyAppellantAboutLpaFinalComments(appeal, notifyClient, azureAdUserId) {
	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	if (!recipientEmail) {
		throw new Error(
			`${ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL}: no appellant email address in appeal`
		);
	}

	return notifyPublished({
		appeal,
		notifyClient,
		templateName: 'final-comments-done-appellant',
		recipientEmail,
		azureAdUserId
	});
}

/**
 * @param {Appeal} appeal
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @param {'appellant' | 'local planning authority'} userTypeNoCommentSubmitted
 */
function notifyNoFinalComments(appeal, notifyClient, azureAdUserId, userTypeNoCommentSubmitted) {
	const recipientEmail =
		userTypeNoCommentSubmitted === 'appellant'
			? appeal.lpa?.email
			: appeal.agent?.email || appeal.appellant?.email;

	return notifyPublished({
		appeal,
		notifyClient,
		templateName: 'final-comments-none',
		recipientEmail,
		azureAdUserId,
		userTypeNoCommentSubmitted
	});
}
