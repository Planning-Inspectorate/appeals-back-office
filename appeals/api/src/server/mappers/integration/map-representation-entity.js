import { mapDate } from '#utils/mapping/map-dates.js';
import {
	isValidRejectionReason,
	isValidRepStatus,
	isValidRepType,
	isValidSource
} from '#utils/mapping/map-enums.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import {
	APPEAL_REPRESENTATION_TYPE,
	APPEAL_REPRESENTATION_STATUS,
	COMMENT_STATUS
} from '@pins/appeals/constants/common.js';

import {
	APPEAL_REPRESENTATION_TYPE as REPRESENTATION_TYPE,
	APPEAL_REPRESENTATION_STATUS as REPRESENTATION_STATUS
} from 'pins-data-model';
import { serviceUserIdStartRange } from './map-service-user-entity.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation & { appeal?: Appeal }} RepresentationWithAppeal */
/** @typedef {import('pins-data-model').Schemas.AppealRepresentation} AppealRepresentation */
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
			representationType: mapRepresentationType(data.representationType),
			...mapAppealInfo(data.appeal),
			representationStatus: mapRepresentationStatus(data.status),
			redacted: data.redactedRepresentation
				? typeof data.redactedRepresentation === 'boolean'
					? data.redactedRepresentation
					: data.redactedRepresentation.trim() !== ''
				: false,
			redactedRepresentation: data.redactedRepresentation,
			originalRepresentation: data.originalRepresentation,
			source: mapSource(data),
			redactedBy: null,
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
	if (data.source === ODW_SYSTEM_ID) {
		return data.lpaCode ? 'lpa' : 'citizen';
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
			reason.representationRejectionReasonText.map((txt) =>
				customReasons.push(`${reason.representationRejectionReason.name}: ${txt}`)
			);
		});

	return {
		invalidOrIncompleteDetails: /** @type {RejectionReason[]} */ (defaultReasons || []),
		otherInvalidOrIncompleteDetails: customReasons
	};
};

/** @type {Record<string, typeof REPRESENTATION_TYPE[keyof typeof REPRESENTATION_TYPE]>} */
const repTypeMapper = {
	[APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT]: REPRESENTATION_TYPE.STATEMENT,
	[APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT]: REPRESENTATION_TYPE.FINAL_COMMENT,
	[APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT]: REPRESENTATION_TYPE.STATEMENT,
	[APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT]: REPRESENTATION_TYPE.FINAL_COMMENT,
	[APPEAL_REPRESENTATION_TYPE.COMMENT]: REPRESENTATION_TYPE.COMMENT
};

/** @type {Record<string, typeof REPRESENTATION_STATUS[keyof typeof REPRESENTATION_STATUS]>} */
const repStatusMapper = {
	[APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW]: REPRESENTATION_STATUS.AWAITING_REVIEW,
	[APPEAL_REPRESENTATION_STATUS.VALID]: REPRESENTATION_STATUS.VALID,
	[APPEAL_REPRESENTATION_STATUS.INVALID]: REPRESENTATION_STATUS.INVALID,
	[APPEAL_REPRESENTATION_STATUS.INCOMPLETE]: REPRESENTATION_STATUS.INVALID_INCOMPLETE,
	[APPEAL_REPRESENTATION_STATUS.PUBLISHED]: REPRESENTATION_STATUS.PUBLISHED,
	[APPEAL_REPRESENTATION_STATUS.WITHDRAWN]: REPRESENTATION_STATUS.WITHDRAWN,
	[COMMENT_STATUS.VALID_REQUIRES_REDACTION]: REPRESENTATION_STATUS.AWAITING_REVIEW
};
