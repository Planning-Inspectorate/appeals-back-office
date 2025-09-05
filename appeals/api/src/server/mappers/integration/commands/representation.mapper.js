/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealRepresentationSubmission} AppealRepresentationSubmission */

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#db-client').Prisma.ServiceUserCreateOrConnectWithoutAppealsInput} ServiceUserConnectInput */
/** @typedef {Omit<import('#db-client').Prisma.RepresentationCreateInput, 'appeal'> & {represented?: ServiceUserConnectInput|undefined}} RepresentationCreateInput */
/** @typedef {import('#db-client').Prisma.DocumentVersionCreateInput} DocumentVersionCreateInput */

import { serviceUserIdStartRange } from '#mappers/integration/map-service-user-entity.js';
import { APPEAL_REPRESENTATION_TYPE as INTERNAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@planning-inspectorate/data-model';
import { mapDocumentIn } from './document.mapper.js';
import { mapServiceUserIn } from './service-user.mapper.js';

/**
 *
 * @param {AppealRepresentationSubmission} submission
 * @returns {{representation: Omit<RepresentationCreateInput, 'appeal'>, attachments: DocumentVersionCreateInput[]}}
 */
export const mapRepresentationIn = (submission) => {
	const { newUser, documents, ...data } = submission;

	let serviceUser;
	if (newUser !== null) {
		serviceUser = mapServiceUserIn(newUser, true);
	}

	const attachments = documents.map((doc) => mapDocumentIn(doc, 'representation'));
	const serviceUserId = data.serviceUserId
		? Number(data.serviceUserId) - serviceUserIdStartRange
		: undefined;

	const representation = {
		representationType: mapRepresentationType({
			lpaCode: data.lpaCode ?? null,
			representationType: data.representationType
		}),
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
 * @param {{representationType: string|null, lpaCode: string|null}} data
 * @returns {string}
 */
export const mapRepresentationType = (data) => {
	if (data.representationType !== null) {
		switch (data.representationType) {
			case APPEAL_REPRESENTATION_TYPE.STATEMENT:
				return data.lpaCode
					? INTERNAL_REPRESENTATION_TYPE.LPA_STATEMENT
					: INTERNAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT;
			case APPEAL_REPRESENTATION_TYPE.FINAL_COMMENT:
				return data.lpaCode
					? INTERNAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
					: INTERNAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT;

			case APPEAL_REPRESENTATION_TYPE.PROOFS_EVIDENCE: //TODO: missing user journey
			default:
				return APPEAL_REPRESENTATION_TYPE.COMMENT;
		}
	}

	return APPEAL_REPRESENTATION_TYPE.COMMENT;
};
