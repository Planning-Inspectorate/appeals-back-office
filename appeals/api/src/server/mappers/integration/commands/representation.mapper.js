/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealRepresentationSubmission} AppealRepresentationSubmission */

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#db-client/models.ts').ServiceUserCreateOrConnectWithoutAppealsInput} ServiceUserConnectInput */
/** @typedef {Omit<import('#db-client/models.ts').RepresentationCreateInput, 'appeal'> & {represented?: ServiceUserConnectInput|undefined}} RepresentationCreateInput */
/** @typedef {import('#db-client/models.ts').DocumentVersionCreateInput} DocumentVersionCreateInput */

import { serviceUserIdStartRange } from '#mappers/integration/map-service-user-entity.js';
import { APPEAL_REPRESENTATION_TYPE as INTERNAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import {
	APPEAL_CASE_STAGE,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@planning-inspectorate/data-model';
import { mapDocumentIn } from './document.mapper.js';
import { mapServiceUserIn } from './service-user.mapper.js';

/**
 *
 * @param {AppealRepresentationSubmission} submission
 * @param {boolean} isRule6Party
 * @returns {{representation: Omit<RepresentationCreateInput, 'appeal'>, attachments: DocumentVersionCreateInput[]}}
 */
export const mapRepresentationIn = (submission, isRule6Party) => {
	const { newUser, documents, ...data } = submission;

	let serviceUser;
	if (newUser !== null) {
		serviceUser = mapServiceUserIn(newUser, true);
	}

	const representationType = mapRepresentationType({
		lpaCode: data.lpaCode ?? null,
		representationType: data.representationType,
		isRule6Party
	});

	const attachments = documents.map((doc) => {
		if (representationType === INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT) {
			doc.documentType = APPEAL_DOCUMENT_TYPE.RULE_6_STATEMENT;
			doc.stage = APPEAL_CASE_STAGE.STATEMENTS;
		} else if (representationType === INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE) {
			doc.documentType = APPEAL_DOCUMENT_TYPE.RULE_6_PROOF_OF_EVIDENCE;
			doc.stage = APPEAL_CASE_STAGE.STATEMENTS;
		}
		return mapDocumentIn(doc, 'representation');
	});

	const serviceUserId = data.serviceUserId
		? Number(data.serviceUserId) - serviceUserIdStartRange
		: undefined;

	const representation = {
		representationType,
		originalRepresentation: data.representation,
		status: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
		...(serviceUserId && {
			represented: {
				connect: { id: serviceUserId }
			},
			source: 'citizen'
		}),
		...(newUser && {
			represented: {
				create: serviceUser
			},
			source: 'citizen'
		}),
		...(data.lpaCode && {
			lpa: {
				connect: { lpaCode: data.lpaCode }
			},
			source: 'lpa'
		}),
		dateCreated: data.representationSubmittedDate ?? new Date(),
		dateLastUpdated: new Date()
	};

	return {
		// @ts-ignore
		representation,
		attachments
	};
};

/**
 *
 * @param {{representationType: string|null, lpaCode: string|null, isRule6Party: boolean}} data
 * @returns {string}
 */
export const mapRepresentationType = (data) => {
	if (data.representationType !== null) {
		switch (data.representationType) {
			case APPEAL_REPRESENTATION_TYPE.STATEMENT:
				return data.isRule6Party
					? INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT
					: data.lpaCode
					? INTERNAL_REPRESENTATION_TYPE.LPA_STATEMENT
					: INTERNAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT;
			case APPEAL_REPRESENTATION_TYPE.FINAL_COMMENT:
				return data.lpaCode
					? INTERNAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
					: INTERNAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT;

			case APPEAL_REPRESENTATION_TYPE.PROOFS_EVIDENCE:
				return data.isRule6Party
					? INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
					: data.lpaCode
					? INTERNAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE
					: INTERNAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE;
			default:
				return APPEAL_REPRESENTATION_TYPE.COMMENT;
		}
	}

	return APPEAL_REPRESENTATION_TYPE.COMMENT;
};
