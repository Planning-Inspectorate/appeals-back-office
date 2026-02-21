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
import { isLinkedAppealsActive } from '#utils/is-linked-appeal.js';
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
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE
} from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateAddressRequest} UpdateAddressRequest */
/** @typedef {import('#db-client/models.ts').RepresentationUpdateInput} RepresentationUpdateInput */
/** @typedef {import('#db-client/models.ts').RepresentationUncheckedCreateInput} RepresentationCreateInput */

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

	if (
		[
			APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT,
			APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
		].includes(repType) &&
		partyName
	) {
		if (status === APPEAL_REPRESENTATION_STATUS.INCOMPLETE && extendedDate) {
			// @ts-ignore
			return stringTokenReplacement(CONSTANTS[auditText], [partyName, partyName, extendedDate]);
		}
		// @ts-ignore
		return stringTokenReplacement(CONSTANTS[auditText], [partyName]);
	}

	if (
		repType === APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT &&
		status === APPEAL_REPRESENTATION_STATUS.INCOMPLETE &&
		extendedDate
	) {
		// @ts-ignore
		return stringTokenReplacement(CONSTANTS[auditText], [extendedDate]);
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
	if (input.representationType === APPEAL_REPRESENTATION_TYPE.COMMENT) {
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
	} else if (input.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT) {
		representedId = input.representedId;
	} else if (
		input.representationType === APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT ||
		input.representationType === APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
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
 * @param {number} representedId
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 * */
export const createRepresentationProofOfEvidence = async (
	appeal,
	proofOfEvidenceType,
	attachments,
	representedId
) => {
	/** @type {RepresentationCreateInput} */
	const representationData = {
		appealId: appeal.id,
		representationType:
			proofOfEvidenceType === 'lpa'
				? APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE
				: proofOfEvidenceType === 'rule-6-party'
					? APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
					: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
		source: proofOfEvidenceType === 'lpa' ? 'lpa' : 'citizen',
		dateCreated: new Date()
	};

	if (proofOfEvidenceType === 'rule-6-party') {
		representationData.representedId = Number(representedId);
	} else if (proofOfEvidenceType === 'lpa') {
		representationData.lpaCode = appeal.lpa?.lpaCode;
	} else {
		representationData.representedId = appeal.appellantId;
	}

	const representation = await representationRepository.createRepresentation(representationData);

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
	await broadcasters.broadcastRepresentation(repId, EventType.Create);

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
	const statementsToPublish = [APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT];
	if (isFeatureActive(FEATURE_FLAG_NAMES.APPELLANT_STATEMENT)) {
		statementsToPublish.push(APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT);
	}
	if (isFeatureActive(FEATURE_FLAG_NAMES.RULE_6_STATEMENT)) {
		statementsToPublish.push(APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT);
	}

	const result = await representationRepository.updateRepresentations(
		appeal.id,
		{
			OR: [
				{
					representationType: {
						in: statementsToPublish
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

	if (isLinkedAppealsActive(appeal)) {
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
	const hasRule6Statement = result.some(
		(rep) => rep.representationType === APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT
	);
	const hasRule6Parties =
		Array.isArray(appeal.appealRule6Parties) && appeal.appealRule6Parties.length > 0;
	const isHearingProcedure = String(appeal.procedureType?.key) === APPEAL_CASE_PROCEDURE.HEARING;

	const isInquiryProcedure = String(appeal.procedureType?.key) === APPEAL_CASE_PROCEDURE.INQUIRY;
	const lpaPath = `${config.frontOffice.url}/manage-appeals/${appeal.reference}`;
	const appellantPath = `${config.frontOffice.url}/appeals/${appeal.reference}`;

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
			whatHappensNextAppellant = `You need to [submit your proof of evidence and witnesses](${appellantPath}) by ${proofOfEvidenceDueDate}.`;
			whatHappensNextLpa = `You need to [submit your proof of evidence and witnesses](${lpaPath}) by ${proofOfEvidenceDueDate}.`;
		} else {
			whatHappensNextAppellant = `You need to [submit your final comments](${appellantPath}) by ${finalCommentsDueDate}.`;
			whatHappensNextLpa = hasIpComments
				? `You need to [submit your final comments](${lpaPath}) by ${finalCommentsDueDate}.`
				: `The inspector will visit the site and we will contact you when we have made the decision.`;
		}

		let lpaTemplate = 'received-statement-and-ip-comments-lpa';
		let appellantTemplate = 'received-statement-and-ip-comments-appellant';
		let rule6Template = 'received-statement-and-ip-comments-appellant';

		if (isInquiryProcedure && !hasLpaStatement && !hasIpComments && !hasRule6Statement) {
			lpaTemplate = 'not-received-statement-and-ip-comments';
			appellantTemplate = 'not-received-statement-and-ip-comments';
			rule6Template = 'not-received-statement-and-ip-comments';
		} else if (isInquiryProcedure && !hasLpaStatement && hasRule6Statement) {
			lpaTemplate = 'rule-6-statement-received';
			appellantTemplate = 'rule-6-statement-received';
			rule6Template = 'received-only-rule-6-statement-rule-6-party';
		}

		const contacts = [
			{
				email: appeal.lpa?.email,
				template: lpaTemplate,
				whatHappensNextTemplate: whatHappensNextLpa,
				url: lpaPath
			},
			{
				email: appeal.agent?.email || appeal.appellant?.email,
				template: appellantTemplate,
				whatHappensNextTemplate: whatHappensNextAppellant,
				url: appellantPath
			},
			...(appeal.appealRule6Parties?.map((rule6Party) => ({
				email: rule6Party.serviceUser?.email,
				template: rule6Template,
				whatHappensNextTemplate: whatHappensNextAppellant,
				url: undefined
			})) ?? [])
		];

		contacts.forEach(async (contact) => {
			await notifyPublished({
				appeal,
				notifyClient,
				hasLpaStatement,
				hasIpComments,
				hasRule6Parties,
				hasRule6Statement,
				isHearingProcedure,
				isInquiryProcedure,
				statementUrl: contact.url,
				templateName: contact.template,
				recipientEmail: contact.email,
				finalCommentsDueDate,
				whatHappensNext: contact.whatHappensNextTemplate,
				azureAdUserId
			});
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

	if (isLinkedAppealsActive(appeal)) {
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

	if (isLinkedAppealsActive(appeal)) {
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

		const isLpaValid =
			lpaProofOfEvidence &&
			lpaProofOfEvidence.status !== APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;

		const isAppellantValid =
			appellantProofOfEvidence &&
			appellantProofOfEvidence.status !== APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;

		const rule6PartiesStatus = (appeal.appealRule6Parties || []).map((party) => {
			const rep = appeal.representations?.find(
				(r) =>
					r.representationType === APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE &&
					r.representedId === party.serviceUser?.id
			);
			const isValid = rep && rep.status !== APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;
			return { party, isValid };
		});

		const inquiryDetailWarningText =
			'The details of the inquiry are subject to change. We will contact you by email if we make any changes.';
		const inquiryWitnessesText =
			'Your witnesses should be available for the duration of the inquiry.';
		const inquiryDate =
			dateISOStringToDisplayDate(
				typeof appeal.inquiry?.inquiryStartTime === 'string'
					? appeal.inquiry?.inquiryStartTime
					: appeal.inquiry?.inquiryStartTime.toISOString()
			) || 'Not Available';
		const inquiryTime =
			formatTime12h(
				typeof appeal.inquiry?.inquiryStartTime === 'string'
					? new Date(appeal.inquiry?.inquiryStartTime)
					: appeal.inquiry?.inquiryStartTime
			) || 'Not available';

		const inquiryAddress = appeal.inquiry?.address
			? formatAddressSingleLine(appeal.inquiry?.address)
			: '';
		const inquiryExpectedDays = appeal.inquiry?.estimatedDays
			? appeal.inquiry?.estimatedDays.toString()
			: 'Not available';
		const whatHappensNext = appeal.inquiry
			? `You need to attend the inquiry on ${inquiryDate}.`
			: 'We will contact you by email when we set up the inquiry';

		const allParties = [];
		allParties.push({
			name: 'local planning authority',
			id: 'lpa',
			email: appeal.lpa?.email,
			isValid: isLpaValid
		});
		allParties.push({
			name: 'appellant',
			id: 'appellant',
			email: appeal.agent?.email || appeal.appellant?.email,
			isValid: isAppellantValid
		});

		for (const r6 of rule6PartiesStatus) {
			allParties.push({
				name: r6.party.serviceUser?.organisationName || 'Rule 6 party',
				id: r6.party.id,
				email: r6.party.serviceUser?.email,
				isValid: r6.isValid,
				isRule6: true
			});
		}

		const submittedParties = allParties.filter((p) => p.isValid);
		const missingParties = allParties.filter((p) => !p.isValid);
		const recipients = allParties.filter((p) => p.email);

		for (const recipient of recipients) {
			let templateName;
			let partiesToNotifyAbout;
			let subjectLine;
			let templateWhatHappensNext;
			const othersSubmitted = submittedParties.filter((p) => p.id !== recipient.id);
			const othersMissing = missingParties.filter((p) => p.id !== recipient.id);

			const isRecipientSubmitted = recipient.isValid;

			if (isRecipientSubmitted) {
				if (othersMissing.length > 0) {
					templateName = 'not-received-proof-of-evidence-and-witnesses';
					partiesToNotifyAbout = othersMissing;
				} else {
					templateName = 'proof-of-evidence-and-witnesses-shared';
					partiesToNotifyAbout = othersSubmitted;
				}
			} else {
				if (othersSubmitted.length > 0) {
					templateName = 'proof-of-evidence-and-witnesses-shared';
					partiesToNotifyAbout = othersSubmitted;
				} else {
					templateName = 'not-received-proof-of-evidence-and-witnesses';
					partiesToNotifyAbout = othersMissing;
				}
			}

			if (templateName === 'proof-of-evidence-and-witnesses-shared') {
				subjectLine = partiesToNotifyAbout.map((p) => p.name);
				templateWhatHappensNext =
					recipient.id === 'lpa' ? 'manage-appeals' : recipient.isRule6 ? 'rule-6' : 'appeals';
			} else {
				const formatter = new Intl.ListFormat('en', { style: 'long', type: 'disjunction' });
				templateWhatHappensNext = whatHappensNext;
				const namesList = formatter.format(
					partiesToNotifyAbout.map((p) => p.name).filter((n) => typeof n === 'string')
				);
				subjectLine = `We did not receive any proof of evidence and witnesses from the ${namesList}`;
			}

			if (partiesToNotifyAbout.length > 0) {
				await notifyPublished({
					appeal,
					notifyClient,
					isInquiryProcedure: true,
					templateName,
					recipientEmail: recipient.email,
					whatHappensNext: templateWhatHappensNext,
					azureAdUserId,
					inquiryDetailWarningText,
					inquiryWitnessesText,
					inquiryDate,
					inquiryTime,
					inquiryExpectedDays,
					inquiryAddress,
					inquirySubjectLine: subjectLine
				});
			}
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
 * @property {boolean} [hasRule6Parties]
 * @property {boolean} [hasRule6Statement]
 * @property {boolean} [isHearingProcedure]
 * @property {boolean} [isInquiryProcedure]
 * @property {string} [statementUrl]
 * @property {string | string[]} [inquirySubjectLine]
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
	hasRule6Parties = false,
	hasRule6Statement = false,
	isHearingProcedure = false,
	isInquiryProcedure = false,
	statementUrl = '',
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
	const enforcementReference =
		appeal.appealType?.key === APPEAL_CASE_TYPE.C && appeal.appellantCase?.enforcementReference;
	if (!lpaReference && !enforcementReference) {
		throw new Error(
			`${ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL}: no applicationReference or enforcementReference in appeal`
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
			lpa_reference: lpaReference || '',
			...(enforcementReference && { enforcement_reference: enforcementReference }),
			final_comments_deadline: finalCommentsDueDate,
			what_happens_next: whatHappensNext,
			has_ip_comments: hasIpComments,
			has_statement: hasLpaStatement,
			has_rule_6_parties: hasRule6Parties,
			has_rule_6_statement: hasRule6Statement,
			is_hearing_procedure: isHearingProcedure,
			is_inquiry_procedure: isInquiryProcedure,
			statement_url: statementUrl,
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
