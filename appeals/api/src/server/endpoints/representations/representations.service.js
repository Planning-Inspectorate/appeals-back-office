import config from '#config/config.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
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
import { databaseConnector } from '#utils/database-connector.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
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
import formatDate, {
	dateISOStringToDisplayDate,
	formatTime12h
} from '@pins/appeals/utils/date-formatter.js';
import { EventType } from '@pins/event-client';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateAddressRequest} UpdateAddressRequest */
/** @typedef {import('#db-client/models.ts').RepresentationUpdateInput} RepresentationUpdateInput */

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
 * @param {string} status
 * @param {string} repType
 * @param {Boolean} redactedRep
 * @param {string} [partyName]
 * @param {string} [extendedDate]
 * @returns String
 */
export const getRepStatusAuditLogDetails = (
	status,
	repType,
	redactedRep,
	partyName,
	extendedDate
) => {
	let auditText;
	const auditTitle = 'AUDIT_TRAIL_REP_';
	const valid = '_STATUS_VALID';
	const invalid = '_STATUS_INVALID';
	const incomplete = '_STATUS_INCOMPLETE';
	const incompleteExtended = '_STATUS_INCOMPLETE_EXTENDED';
	const redactedAccepted = '_STATUS_REDACTED_AND_ACCEPTED';

	let suffix = '';

	if (status === APPEAL_REPRESENTATION_STATUS.VALID && redactedRep === true) {
		suffix = redactedAccepted;
	} else if (status === APPEAL_REPRESENTATION_STATUS.VALID) {
		suffix = valid;
	} else if (status === APPEAL_REPRESENTATION_STATUS.INVALID) {
		suffix = invalid;
	} else if (status === APPEAL_REPRESENTATION_STATUS.INCOMPLETE && extendedDate) {
		suffix = incompleteExtended;
	} else if (status === APPEAL_REPRESENTATION_STATUS.INCOMPLETE) {
		suffix = incomplete;
	}

	auditText = auditTitle + camelToScreamingSnake(repType) + suffix;

	if (repType === APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT && partyName) {
		if (status === APPEAL_REPRESENTATION_STATUS.INCOMPLETE && extendedDate) {
			// @ts-ignore
			return stringTokenReplacement(CONSTANTS[auditText], [partyName, partyName, extendedDate]);
		}
		// @ts-ignore
		return stringTokenReplacement(CONSTANTS[auditText], [partyName]);
	}

	// @ts-ignore
	return CONSTANTS[auditText];
};

/** @typedef {Awaited<ReturnType<getRepresentation>>} DBRepresentation */

/**
 * @typedef {Object} CreateRepresentationInput
 * @property {'comment' | 'lpa_statement' | 'appellant_statement' | 'lpa_final_comment' | 'appellant_final_comment' | 'lpa_proofs_evidence' | 'appellant_proofs_evidence'} representationType
 * @property {{ firstName: string, lastName: string, email: string }} [ipDetails]
 * @property {{ addressLine1: string, addressLine2?: string, town: string, county?: string, postCode: string }} [ipAddress]
 * @property {string[]} attachments
 * @property {string | undefined} dateCreated
 * @property {string} redactionStatus
 * @property {string} source
 * @property {string} [status]
 * @property {string} [lpaCode]
 * @property {string} [appellantId]
 * @property {string} [representationText]
 * @property {number} [representedId]
 *
 * @param {number} appealId
 * @param {CreateRepresentationInput} input
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 * */
export const createRepresentation = async (appealId, input) => {
	let representedId;
	if (input.representationType == APPEAL_REPRESENTATION_TYPE.COMMENT) {
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
			firstName: ipDetails?.firstName,
			lastName: ipDetails?.lastName,
			email: ipDetails?.email,
			addressId: address ? address.id : undefined
		});
		representedId = represented.id;
	} else if (input.representationType == APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT) {
		representedId = input.representedId;
	} else if (
		input.representationType == APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT ||
		input.representationType == APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
	) {
		representedId = Number(input.representedId);
	}

	const representation = await representationRepository.createRepresentation({
		appealId,
		representedId,
		representationType: input.representationType,
		source: input.source,
		dateCreated: input.dateCreated,
		status: input.status,
		lpaCode: input.lpaCode,
		originalRepresentation: input.representationText
	});

	if (input.attachments.length > 0) {
		const documents = await documentRepository.getDocumentsByIds(input.attachments);

		const mappedDocuments = documents.map((d) => ({
			documentGuid: d.guid,
			version: d.latestDocumentVersion?.version ?? 1
		}));

		await representationRepository.addAttachments(representation.id, mappedDocuments);

		for (const document of mappedDocuments) {
			if (document?.documentGuid) {
				await broadcasters.broadcastDocument(
					document.documentGuid,
					document.version,
					document.version > 1 ? EventType.Update : EventType.Create
				);
			}
		}
	}

	return representation;
};

/**
 * @param {Appeal} appeal
 * @param {string} proofOfEvidenceType
 * @param {string[]} attachments
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 * */
export const createRepresentationProofOfEvidence = async (
	appeal,
	proofOfEvidenceType,
	attachments
) => {
	const representation = await representationRepository.createRepresentation({
		appealId: appeal.id,
		representationType:
			proofOfEvidenceType === 'lpa'
				? APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE
				: proofOfEvidenceType === 'rule-6-party'
					? APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
					: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
		source: proofOfEvidenceType === 'lpa' ? 'lpa' : 'citizen',
		dateCreated: new Date(),
		representedId: appeal.appellantId
	});

	if (attachments.length > 0) {
		const documents = await documentRepository.getDocumentsByIds(attachments);

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

	for (const document of mappedDocuments) {
		if (document?.documentGuid) {
			await broadcasters.broadcastDocument(
				document.documentGuid,
				document.version,
				document.version > 1 ? EventType.Update : EventType.Create
			);
		}
	}

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
			databaseConnector,
			updatedRep.appealId,
			updatedRep.represented.addressId
		);
	} else if (
		[APPEAL_REPRESENTATION_STATUS.VALID, APPEAL_REPRESENTATION_STATUS.INVALID].includes(
			updatedRep.status
		)
	) {
		await neighbouringSitesRepository.connectSite(
			databaseConnector,
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
export async function publishStatements(appeal, azureAdUserId, notifyClient) {
	if (!isCurrentStatus(appeal, APPEAL_CASE_STATUS.STATEMENTS)) {
		throw new BackOfficeAppError('appeal in incorrect state to publish statements', 409);
	}

	const latestDocumentVersionsUpdated = await documentRepository.setRedactionStatusOnValidation(
		appeal.id
	);
	for (const documentUpdated of latestDocumentVersionsUpdated) {
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
					representationType: {
						in: [
							APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
							APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
							APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT
						]
					},
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

	if (isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
		await transitionLinkedChildAppealsState(appeal, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
	}
	await transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);

	const finalCommentsDueDate = formatDate(
		new Date(appeal.appealTimetable?.finalCommentsDueDate || ''),
		false
	);

	const proofOfEvidenceDueDate = formatDate(
		new Date(appeal.appealTimetable?.proofOfEvidenceAndWitnessesDueDate || ''),
		false
	);

	const hasLpaStatement = result.some(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
	);
	const hasIpComments = result.some(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.COMMENT
	);
	const isHearingProcedure = String(appeal.procedureType?.key) === APPEAL_CASE_PROCEDURE.HEARING;

	const isInquiryProcedure = String(appeal.procedureType?.key) === APPEAL_CASE_PROCEDURE.INQUIRY;

	try {
		let whatHappensNextAppellant;
		let whatHappensNextLpa;
		if (isHearingProcedure) {
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
		} else if (isInquiryProcedure) {
			whatHappensNextAppellant = `You need to [submit your proof of evidence and witnesses](${config.frontOffice.url}/appeals/${appeal.reference}) by ${proofOfEvidenceDueDate}.`;
			whatHappensNextLpa = `You need to [submit your proof of evidence and witnesses](${config.frontOffice.url}/manage-appeals/${appeal.reference}) by ${proofOfEvidenceDueDate}.`;
		} else {
			whatHappensNextAppellant = `You need to [submit your final comments](${config.frontOffice.url}/appeals/${appeal.reference}) by ${finalCommentsDueDate}.`;
			whatHappensNextLpa = hasIpComments
				? `You need to [submit your final comments](${config.frontOffice.url}/manage-appeals/${appeal.reference}) by ${finalCommentsDueDate}.`
				: `The inspector will visit the site and we will contact you when we have made the decision.`;
		}

		let lpaTemplate = 'received-statement-and-ip-comments-lpa';
		let appellantTemplate = 'received-statement-and-ip-comments-appellant';

		if (isInquiryProcedure && !hasLpaStatement && !hasIpComments) {
			lpaTemplate = 'not-received-statement-and-ip-comments';
			appellantTemplate = 'not-received-statement-and-ip-comments';
		}

		await notifyPublished({
			appeal,
			notifyClient,
			hasLpaStatement,
			hasIpComments,
			isHearingProcedure,
			isInquiryProcedure,
			templateName: lpaTemplate,
			recipientEmail: appeal.lpa?.email,
			finalCommentsDueDate,
			whatHappensNext: whatHappensNextLpa,
			azureAdUserId
		});

		await notifyPublished({
			appeal,
			notifyClient,
			hasLpaStatement,
			hasIpComments,
			isHearingProcedure,
			isInquiryProcedure,
			templateName: appellantTemplate,
			recipientEmail: appeal.agent?.email || appeal.appellant?.email,
			finalCommentsDueDate,
			whatHappensNext: whatHappensNextAppellant,
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

	const latestDocumentVersionsUpdated = await documentRepository.setRedactionStatusOnValidation(
		appeal.id
	);
	for (const documentUpdated of latestDocumentVersionsUpdated) {
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

	if (isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
		await transitionLinkedChildAppealsState(appeal, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
	}
	await transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);

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

/** @type {PublishFunction} */
export async function publishProofOfEvidence(appeal, azureAdUserId, notifyClient) {
	if (!isCurrentStatus(appeal, APPEAL_CASE_STATUS.EVIDENCE)) {
		throw new BackOfficeAppError('appeal in incorrect state to publish proof of evidence', 409);
	}

	const latestDocumentVersionsUpdated = await documentRepository.setRedactionStatusOnValidation(
		appeal.id
	);
	for (const documentUpdated of latestDocumentVersionsUpdated) {
		await broadcasters.broadcastDocument(
			documentUpdated.documentGuid,
			documentUpdated.version,
			EventType.Update
		);
	}

	const representationTypes = [
		APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
		APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE
	];

	if (isFeatureActive(FEATURE_FLAG_NAMES.RULE_6_PARTIES_POE)) {
		representationTypes.push(APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE);
	}

	const result = await representationRepository.updateRepresentations(
		appeal.id,
		{
			representationType: {
				in: representationTypes
			},
			status: {
				in: [
					APPEAL_REPRESENTATION_STATUS.VALID,
					APPEAL_REPRESENTATION_STATUS.INCOMPLETE,
					APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
				]
			}
		},
		{
			status: APPEAL_REPRESENTATION_STATUS.PUBLISHED
		}
	);

	if (isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
		await transitionLinkedChildAppealsState(appeal, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
	}
	await transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);

	try {
		const lpaProofOfEvidence = appeal.representations?.find(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE
		);
		const appellantProofOfEvidence = appeal.representations?.find(
			(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE
		);

		const inquiryDetailWarningText =
			'The details of the inquiry are subject to change. We will contact you by email if we make any changes.';
		const inquiryWitnessesText =
			'Your witnesses should be available for the duration of the inquiry.';
		const inquiryDate = dateISOStringToDisplayDate(
			typeof appeal.inquiry?.inquiryStartTime === 'string'
				? appeal.inquiry?.inquiryStartTime
				: appeal.inquiry?.inquiryStartTime.toISOString()
		);
		const inquiryTime = formatTime12h(
			typeof appeal.inquiry?.inquiryStartTime === 'string'
				? new Date(appeal.inquiry?.inquiryStartTime)
				: appeal.inquiry?.inquiryStartTime
		);

		const inquiryAddress = appeal.inquiry?.address
			? formatAddressSingleLine(appeal.inquiry?.address)
			: '';
		const inquiryExpectedDays = appeal.inquiry?.estimatedDays
			? appeal.inquiry?.estimatedDays.toString()
			: 'Not available';
		const whatHappensNext = appeal.inquiry
			? `You need to attend the inquiry on ${inquiryDate}.`
			: 'We will contact you by email when we set up the inquiry';

		if (
			!lpaProofOfEvidence ||
			lpaProofOfEvidence.status === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
		) {
			await notifyPublished({
				appeal,
				notifyClient,
				isInquiryProcedure: true,
				templateName: 'not-received-proof-of-evidence-and-witnesses',
				recipientEmail: appeal.agent?.email || appeal.appellant?.email,
				whatHappensNext,
				azureAdUserId,
				inquiryDetailWarningText,
				inquiryWitnessesText,
				inquiryDate,
				inquiryTime,
				inquiryExpectedDays,
				inquiryAddress,
				inquirySubjectLine:
					'We did not receive any proof of evidence and witnesses from local planning authority or any other parties'
			});
		}

		if (
			!appellantProofOfEvidence ||
			appellantProofOfEvidence.status === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
		) {
			await notifyPublished({
				appeal,
				notifyClient,
				isInquiryProcedure: true,
				templateName: 'not-received-proof-of-evidence-and-witnesses',
				recipientEmail: appeal.lpa?.email,
				whatHappensNext,
				azureAdUserId,
				inquiryDetailWarningText,
				inquiryWitnessesText,
				inquiryDate,
				inquiryTime,
				inquiryExpectedDays,
				inquiryAddress,
				inquirySubjectLine:
					'We did not receive any proof of evidence and witnesses from appellant or any other parties'
			});
		}

		if (lpaProofOfEvidence && appellantProofOfEvidence) {
			await notifyPublished({
				appeal,
				notifyClient,
				isInquiryProcedure: true,
				templateName: 'proof-of-evidence-and-witnesses-shared',
				recipientEmail: appeal.agent?.email || appeal.appellant?.email,
				whatHappensNext: 'appeals',
				azureAdUserId,
				inquiryDate,
				inquirySubjectLine: 'local planning authority'
			});

			await notifyPublished({
				appeal,
				notifyClient,
				isInquiryProcedure: true,
				templateName: 'proof-of-evidence-and-witnesses-shared',
				recipientEmail: appeal.lpa?.email,
				whatHappensNext: 'manage-appeals',
				azureAdUserId,
				inquiryDate,
				inquirySubjectLine: 'appellant'
			});
			return result;
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
 * @property {boolean} [isHearingProcedure]
 * @property {boolean} [isInquiryProcedure]
 * @property {string} [inquirySubjectLine]
 * @property {string} [userTypeNoCommentSubmitted]
 * @property {string} azureAdUserId
 * @property {string} [inquiryDetailWarningText]
 * @property {string} [inquiryWitnessesText]
 * @property {string} [inquiryDate]
 * @property {string} [inquiryTime]
 * @property {string} [inquiryExpectedDays]
 * @property {string} [inquiryAddress]
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
	isHearingProcedure = false,
	isInquiryProcedure = false,
	userTypeNoCommentSubmitted = '',
	inquiryDetailWarningText = '',
	inquiryWitnessesText = '',
	inquirySubjectLine = '',
	inquiryDate = '',
	inquiryTime = '',
	inquiryExpectedDays = '',
	inquiryAddress = '',
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
			is_hearing_procedure: isHearingProcedure,
			is_inquiry_procedure: isInquiryProcedure,
			user_type: userTypeNoCommentSubmitted,
			team_email_address: await getTeamEmailFromAppealId(appeal.id),
			inquiry_detail_warning_text: inquiryDetailWarningText,
			inquiry_witnesses_text: inquiryWitnessesText,
			inquiry_subject_line: inquirySubjectLine,
			inquiry_date: inquiryDate,
			inquiry_time: inquiryTime,
			inquiry_expected_days: inquiryExpectedDays,
			inquiry_address: inquiryAddress
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
