// @ts-nocheck
import { mapRedactionStatusIdToName } from '#appeals/appeal-documents/appeal-documents.mapper.js';

/**
 * @param {import("@pins/appeals.api/src/database/schema.js").RepresentationAttachment[]} representationAttachments
 * @returns {import("@pins/appeals.api/src/server/endpoints/appeals.js").DocumentInfo[]}
 */
export const mapRepresentationAttachmentsToDocumentInfoArray = (representationAttachments) => {
	return representationAttachments.map((attachment) => ({
		id: attachment.documentGuid,
		caseId: attachment.documentVersion.document.caseId,
		folderId: attachment.documentVersion.document.folderId,
		name: attachment.documentVersion.document.name,
		createdAt: attachment.documentVersion.document.createdAt,
		isDeleted: attachment.documentVersion.document.isDeleted,
		latestDocumentVersion: {
			documentId: attachment.documentVersion.documentGuid,
			version: attachment.documentVersion.version,
			originalFilename: attachment.documentVersion.originalFilename,
			fileName: attachment.documentVersion.fileName,
			blobStorageContainer: attachment.documentVersion.blobStorageContainer,
			blobStoragePath: attachment.documentVersion.blobStoragePath,
			documentURI: attachment.documentVersion.documentURI,
			dateReceived: attachment.documentVersion.dateReceived,
			redactionStatus: mapRedactionStatusIdToName(attachment.documentVersion.redactionStatusId),
			virusCheckStatus: attachment.documentVersion.virusCheckStatus,
			size: attachment.documentVersion.size.toString(),
			mime: attachment.documentVersion.mime,
			isLateEntry: attachment.documentVersion.isLateEntry,
			isDeleted: attachment.documentVersion.isDeleted,
			stage: attachment.documentVersion.stage,
			documentType: attachment.documentVersion.documentType
		},
		allVersions: [],
		versionAudit: []
	}));
};
