import { mapDate } from '#utils/mapping/map-dates.js';
import {
	isValidRejectionReason,
	isValidRepStatus,
	isValidRepType,
	isValidSource
} from '#utils/mapping/map-enums.js';
import {
	COMMENT_STATUS,
	APPEAL_REPRESENTATION_STATUS as INTERNAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE as INTERNAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';

import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@planning-inspectorate/data-model';
import { serviceUserIdStartRange } from './map-service-user-entity.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation & { appeal?: Appeal }} RepresentationWithAppeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealRepresentation} AppealRepresentation */
/** @typedef {'Contains links to web pages'|'Duplicated or repeated comment'|'Includes inflammatory content'|'Includes personal or medical information'|'No list of suggested conditions'|'Not relevant to this appeal'|'Received after deadline'|'other_reason'} RejectionReason*/

/**
 *
 * @param {RepresentationWithAppeal} data
 * @returns {AppealRepresentation | undefined}
 */
export const mapRepresentationEntity = (data) => {
	if (data && data.appeal) {
		return {
			representationId: data.id.toString(),
			representationType: mapRepresentationType(data?.representationType || ''),
			...mapAppealInfo(data.appeal),
			representationStatus: mapRepresentationStatus(data?.status || ''),
			redacted: data.redactedRepresentation !== null,
			redactedRepresentation: data.redactedRepresentation,
			originalRepresentation: data.originalRepresentation,
			source: mapSource(data),
			redactedBy: data.reviewer || null,
			serviceUserId: mapRepresentationUserId(data.representedId),
			...mapReasons(data),
			dateReceived: mapDate(data.dateCreated) ?? '',
			documentIds: data.attachments?.map((attachment) => attachment.documentGuid) ?? []
		};
	}
};

/**
 *
 * @param {number|null} id
 * @returns {string|null}
 */
const mapRepresentationUserId = (id) => (id ? (serviceUserIdStartRange + id).toString() : null);

/**
 *
 * @param {Appeal} appeal
 * @returns {{ caseId: number, caseReference: string }}}
 */
const mapAppealInfo = (appeal) => {
	return {
		caseId: appeal.id,
		caseReference: appeal.reference
	};
};

/**
 *
 * @param {string} type
 * @returns {'comment' | 'final_comment' | 'proofs_evidence' | 'statement' | null}
 */
const mapRepresentationType = (type) => {
	const mapped = repTypeMapper[type];
	return isValidRepType(mapped) ? mapped : null;
};

/**
 * @param {string} status
 * @returns {'archived' | 'awaiting_review' | 'draft' | 'invalid' | 'invalid_incomplete' | 'published' | 'referred' | 'valid' | 'withdrawn' | null}
 */
const mapRepresentationStatus = (status) => {
	const mapped = repStatusMapper[status];
	return isValidRepStatus(mapped) ? mapped : null;
};

/**
 *
 * @param {RepresentationWithAppeal} data
 * @returns {'lpa' | 'citizen' | null}
 */
const mapSource = (data) => {
	if (data.lpa) {
		return 'lpa';
	}

	if (isValidSource(data.source)) {
		return data.source;
	}

	return null;
};

/**
 *
 * @param {RepresentationWithAppeal} data
 * @returns {{invalidOrIncompleteDetails: RejectionReason[], otherInvalidOrIncompleteDetails: string[]}}
 */
const mapReasons = (data) => {
	const defaultReasons =
		data.representationRejectionReasonsSelected
			?.filter((reason) => reason.representationRejectionReason?.hasText === false)
			.map((reason) => reason.representationRejectionReason.name)
			.filter((reason) => isValidRejectionReason(reason || '')) ?? [];

	/** @type {string[]} */
	const customReasons = [];

	data.representationRejectionReasonsSelected
		?.filter((reason) => reason.representationRejectionReason?.hasText === true)
		.forEach((reason) => {
			reason.representationRejectionReasonText.forEach((txt) => {
				customReasons.push(`${reason.representationRejectionReason.name}: ${txt.text}`);
			});
		});

	return {
		invalidOrIncompleteDetails: /** @type {RejectionReason[]} */ (defaultReasons || []),
		otherInvalidOrIncompleteDetails: customReasons
	};
};

/** @type {Record<string, typeof APPEAL_REPRESENTATION_TYPE[keyof typeof APPEAL_REPRESENTATION_TYPE]>} */
const repTypeMapper = {
	[INTERNAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT]: APPEAL_REPRESENTATION_TYPE.STATEMENT,
	[INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT]: APPEAL_REPRESENTATION_TYPE.STATEMENT,
	[INTERNAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT]: APPEAL_REPRESENTATION_TYPE.FINAL_COMMENT,
	[INTERNAL_REPRESENTATION_TYPE.LPA_STATEMENT]: APPEAL_REPRESENTATION_TYPE.STATEMENT,
	[INTERNAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT]: APPEAL_REPRESENTATION_TYPE.FINAL_COMMENT,
	[INTERNAL_REPRESENTATION_TYPE.COMMENT]: APPEAL_REPRESENTATION_TYPE.COMMENT,
	[INTERNAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE]: APPEAL_REPRESENTATION_TYPE.PROOFS_EVIDENCE,
	[INTERNAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE]:
		APPEAL_REPRESENTATION_TYPE.PROOFS_EVIDENCE,
	[INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE]:
		APPEAL_REPRESENTATION_TYPE.PROOFS_EVIDENCE
};

/** @type {Record<string, typeof APPEAL_REPRESENTATION_STATUS[keyof typeof APPEAL_REPRESENTATION_STATUS]>} */
const repStatusMapper = {
	[INTERNAL_REPRESENTATION_STATUS.AWAITING_REVIEW]: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
	[INTERNAL_REPRESENTATION_STATUS.VALID]: APPEAL_REPRESENTATION_STATUS.VALID,
	[INTERNAL_REPRESENTATION_STATUS.INVALID]: APPEAL_REPRESENTATION_STATUS.INVALID,
	[INTERNAL_REPRESENTATION_STATUS.INCOMPLETE]: APPEAL_REPRESENTATION_STATUS.INVALID_INCOMPLETE,
	[INTERNAL_REPRESENTATION_STATUS.PUBLISHED]: APPEAL_REPRESENTATION_STATUS.PUBLISHED,
	[INTERNAL_REPRESENTATION_STATUS.WITHDRAWN]: APPEAL_REPRESENTATION_STATUS.WITHDRAWN,
	[COMMENT_STATUS.VALID_REQUIRES_REDACTION]: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
};
