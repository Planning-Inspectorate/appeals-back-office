import formatAddress from '#utils/format-address.js';
import { formatName } from '#utils/format-name.js';
import { APPEAL_ORIGIN } from '@planning-inspectorate/data-model';

/** @typedef {import('./representations.service.js').DBRepresentation} Representation */
/** @typedef {import('./representations.service.js').UpdatedDBRepresentation} UpdatedRepresentation */
/** @typedef {NonNullable<Representation>['attachments'][0]} RepresentationAttachment */
/** @typedef {import('@pins/appeals.api').Api.RepResponse} FormattedRep */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealRepresentationSubmission['documents'][number]} RepAttachment */

/**
 * @param {Object} rep
 * @returns {rep is Representation}
 */
const repHasAttachments = (rep) => Object.hasOwn(rep, 'attachments');

/**
 * @param {NonNullable<Representation> | UpdatedRepresentation} rep
 * @returns {FormattedRep}
 */
export const formatRepresentation = (rep) => {
	/** @type {FormattedRep} */
	const formatted = {
		id: rep.id,
		origin: rep.lpa ? APPEAL_ORIGIN.LPA : APPEAL_ORIGIN.CITIZEN,
		author: formatRepresentationSource(rep),
		status: rep.status,
		originalRepresentation: rep.originalRepresentation || '',
		redactedRepresentation: rep.redactedRepresentation || '',
		created: rep.dateCreated.toISOString(),
		notes: rep.notes || '',
		attachments: (() => {
			if (!repHasAttachments(rep)) {
				return [];
			}
			return rep.attachments.map(formatAttachment);
		})(),
		representationType: rep.representationType,
		siteVisitRequested: rep.siteVisitRequested,
		source: rep.source
	};

	if (rep.represented) {
		formatted.represented = {
			id: rep.represented.id,
			name: formatName(rep.represented),
			email: rep.represented.email ?? undefined,
			address: formatAddress(rep.represented.address)
		};
	}

	if (rep.representationRejectionReasonsSelected) {
		formatted.rejectionReasons = rep.representationRejectionReasonsSelected.map((reason) => ({
			id: reason.representationRejectionReason.id,
			name: reason.representationRejectionReason.name,
			hasText: reason.representationRejectionReason.hasText,
			text: reason.representationRejectionReasonText?.map((textObj) => textObj.text) || []
		}));
	}

	return formatted;
};

/**
 *
 * @param {NonNullable<Representation> | UpdatedRepresentation} rep
 * @returns {string}
 */
const formatRepresentationSource = (rep) => {
	if (rep.lpa) {
		return rep.lpa.name;
	}

	if (!rep.represented && rep.representative) {
		return `${rep.representative?.firstName} ${rep.representative?.lastName}`;
	}

	return `${rep.represented?.firstName} ${rep.represented?.lastName}`;
};

/**
 *
 * @param {RepresentationAttachment} attachment
 */
const formatAttachment = (attachment) => {
	const { documentGuid, version, representationId, documentVersion } = attachment;

	const formattedDocumentVersion = documentVersion
		? {
				documentGuid: documentVersion.documentGuid,
				version: documentVersion.version,
				documentType: documentVersion.documentType ?? undefined,
				originalFilename: documentVersion.originalFilename
					? documentVersion.originalFilename.replace(/[a-f\d-]{36}_/, '')
					: undefined,
				fileName: documentVersion.fileName
					? documentVersion.fileName.replace(/[a-f\d-]{36}_/, '')
					: undefined,
				mime: documentVersion.mime ?? undefined,
				size: documentVersion.size ?? undefined,
				blobStoragePath: documentVersion.blobStoragePath ?? undefined,
				documentURI: documentVersion.documentURI ?? undefined,
				document: documentVersion.document
					? {
							guid: documentVersion.document.guid,
							name: documentVersion.document.name
								? documentVersion.document.name.replace(/[a-f\d-]{36}_/, '')
								: undefined,
							caseId: documentVersion.document.caseId,
							folderId: documentVersion.document.folderId,
							createdAt: documentVersion.document.createdAt,
							isDeleted: documentVersion.document.isDeleted,
							latestVersionId: documentVersion.document.latestVersionId
					  }
					: undefined
		  }
		: undefined;

	return {
		documentGuid,
		version,
		representationId,
		documentVersion: formattedDocumentVersion
	};
};
