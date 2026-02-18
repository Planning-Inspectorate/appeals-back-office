import { getAvScanStatus } from '#endpoints/documents/documents.service.js';
import {
	isValidDocumentType,
	isValidRedactionStatus,
	isValidStage,
	isValidVirusCheckStatus
} from '#utils/mapping/map-enums.js';
import { APPEAL_REDACTED_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Api.Folder} Folder */
/** @typedef {import('@pins/appeals.api').Api.Document} DocumentDto */
/** @typedef {import('@pins/appeals.api').Api.DocumentVersion} DocumentVersionDto */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {DocumentVersion} version
 * @returns {DocumentVersionDto|undefined}
 */
const mapDocumentVersion = (version) => {
	if (!version || version.isDeleted === true) {
		return;
	}

	const virusCheckStatus = getAvScanStatus(version);
	const redactionStatus = version.redactionStatus?.key || APPEAL_REDACTED_STATUS.NOT_REDACTED;
	const documentType = version.documentType || '';
	const stage = version.stage || '';

	if (
		isValidRedactionStatus(redactionStatus) &&
		isValidDocumentType(documentType) &&
		isValidVirusCheckStatus(virusCheckStatus) &&
		isValidStage(stage)
	)
		return {
			id: version.documentGuid,
			version: version.version,
			fileName: version.fileName || '',
			originalFileName: version.originalFilename || '',
			dateReceived: version.dateReceived?.toISOString() || '',
			redactionStatus,
			virusCheckStatus,
			size: version?.size || undefined,
			mime: version?.mime || undefined,
			isLateEntry: version?.isLateEntry || false,
			isDeleted: version?.isDeleted,
			documentType: /** @type {any} */ (documentType),
			stage,
			documentURI: version?.documentURI || ''
		};
};

/**
 *
 * @param {Document[]} documents
 * @returns {DocumentDto[]}
 */
export const mapDocuments = (documents) => {
	const documentDtos = documents
		.filter((d) => d.isDeleted === false)
		.map((document) => {
			return {
				caseId: document.caseId,
				folderId: document.folderId,
				id: document.guid,
				name: document.name,
				isDeleted: document.isDeleted,
				createdAt: document.createdAt?.toISOString() || '',
				versionAudit: document.versionAudit || [],
				...(document.latestDocumentVersion && {
					latestDocumentVersion: mapDocumentVersion(document.latestDocumentVersion)
				}),
				...(document.versions && {
					allVersions: document.versions
						?.map((version) => mapDocumentVersion(version))
						.filter((v) => v != undefined)
				})
			};
		});

	return documentDtos;
};

/**
 *
 * @param {MappingRequest} data
 * @returns {Folder[]}
 */
export const mapAppealFolders = (data) => {
	const { appeal } = data;

	if (appeal.folders) {
		const mapped = appeal.folders.map((folder) => {
			return {
				caseId: folder.caseId,
				folderId: folder.id,
				path: folder.path,
				documents: mapDocuments(folder.documents)
			};
		});

		return mapped;
	}

	return [];
};
