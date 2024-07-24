import { databaseConnector } from '#utils/database-connector.js';
import documentRedactionStatusRepository from '#repositories/document-redaction-status.repository.js';
import { findPreviousVersion } from '#utils/find-previous-version.js';
import { randomUUID } from 'node:crypto';
import { APPEAL_REDACTED_STATUS } from 'pins-data-model';
import { APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';

/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} RedactionStatus */

/**
 * @returns {Promise<RedactionStatus | undefined>}
 */
export const getDefaultRedactionStatus = async () => {
	const redactionStatuses =
		await documentRedactionStatusRepository.getAllDocumentRedactionStatuses();
	const defaultRedactionStatus = APPEAL_REDACTED_STATUS.NOT_REDACTED;
	const unredactedStatus = redactionStatuses.find(
		(redactionStatus) => redactionStatus.key === defaultRedactionStatus
	);
	return unredactedStatus;
};

/**
 * @param {any} metadata
 * @param {any} context
 * @returns {Promise<DocumentVersion | null>}
 */
export const addDocument = async (metadata, context) => {
	const unredactedStatus = await getDefaultRedactionStatus();
	const transaction = await databaseConnector.$transaction(async (tx) => {
		const guid = metadata.GUID;

		const document = await tx.document.create({
			data: {
				guid,
				caseId: context.caseId,
				folderId: context.folderId,
				name: metadata.originalFilename
			}
		});

		const { name } = document;

		metadata.documentGuid = guid;
		metadata.version = 1;
		metadata.fileName = name;
		const scanStatus = await tx.documentVersionAvScan.findUnique({
			where: {
				documentGuid_version: {
					documentGuid: guid,
					version: metadata.version
				}
			}
		});
		if (scanStatus) {
			metadata.virusCheckStatus =
				scanStatus.avScanSuccess === true
					? APPEAL_VIRUS_CHECK_STATUS.SCANNED
					: APPEAL_VIRUS_CHECK_STATUS.AFFECTED;
		}

		delete metadata.GUID;

		const documentVersion = await tx.documentVersion.create({
			data: {
				...metadata,
				lastModified: new Date(),
				dateReceived: metadata.dateReceived ?? new Date().toISOString(),
				redactionStatusId: metadata.redactionStatusId ?? unredactedStatus?.id,
				published: false,
				draft: false
			}
		});

		await tx.document.update({
			data: { latestVersionId: documentVersion.version },
			where: { guid }
		});

		const latestVersion = await tx.documentVersion.findFirst({
			include: { document: true },
			where: { documentGuid: guid, version: metadata.version }
		});

		return latestVersion;
	});

	return transaction;
};

/**
 * @param {any} metadata
 * @returns {Promise<DocumentVersion | null>}
 */
export const addDocumentVersion = async ({ documentGuid, ...metadata }) => {
	const unredactedStatus = await getDefaultRedactionStatus();
	const transaction = await databaseConnector.$transaction(async (tx) => {
		const document = await tx.document.findFirst({
			include: {
				case: true,
				versions: true
			},
			where: { guid: documentGuid }
		});

		if (document == null || document.isDeleted) {
			throw new Error('Document not found');
		}

		const { name, versions } = document;

		const newVersionId = versions ? versions.length + 1 : 1;

		metadata.documentGuid = documentGuid;
		metadata.version = newVersionId;
		metadata.fileName = name;

		const scanStatus = await tx.documentVersionAvScan.findUnique({
			where: {
				documentGuid_version: {
					documentGuid,
					version: metadata.version
				}
			}
		});
		if (scanStatus) {
			metadata.virusCheckStatus =
				scanStatus.avScanSuccess === true
					? APPEAL_VIRUS_CHECK_STATUS.SCANNED
					: APPEAL_VIRUS_CHECK_STATUS.AFFECTED;
		}

		await tx.documentVersion.create({
			data: {
				...metadata,
				lastModified: new Date(),
				documentGuid,
				dateReceived: metadata.dateReceived ?? new Date().toISOString(),
				redactionStatusId: metadata.redactionStatusId ?? unredactedStatus?.id,
				published: false,
				draft: false
			}
		});

		await tx.document.update({
			data: { latestVersionId: newVersionId },
			where: { guid: documentGuid }
		});

		const latestVersion = await tx.documentVersion.findFirst({
			include: { document: true },
			where: { documentGuid, version: newVersionId }
		});

		return latestVersion;
	});

	// @ts-ignore
	return transaction;
};

/**
 * @param {string} documentGuid
 * @param {number} version
 */
export const deleteDocumentVersion = async (documentGuid, version) => {
	const transaction = await databaseConnector.$transaction(async (tx) => {
		const document = await tx.document.findFirst({
			include: {
				versions: true,
				latestDocumentVersion: true
			},
			where: { guid: documentGuid }
		});

		if (document && document.latestDocumentVersion && document.versions) {
			const versionToDelete = document.versions.find((v) => v.version === version);
			const versionCount = document.versions.filter((v) => !v.isDeleted).length;

			if (versionToDelete) {
				if (versionToDelete.version !== document.latestDocumentVersion.version) {
					await deleteVersion(tx, document.guid, versionToDelete.version);
				} else {
					if (versionCount === 1) {
						await deleteVersion(tx, document.guid, versionToDelete.version);
						await deleteDocument(tx, document.guid, document.name);
					} else {
						// @ts-ignore
						await setPreviousVersion(tx, document, versionToDelete.version);
						await deleteVersion(tx, document.guid, versionToDelete.version);
					}
				}

				return {
					...document,
					isDeleted: versionCount === 1,
					latestDocumentVersion: null,
					latestVersionId: null,
					documentVersion: []
				};
			}
		}
	});

	return transaction;
};

/**
 * @param {string} documentGuid
 * @param {number} version
 * @param {string} action
 * @param {number} auditTrailId
 */
export const addDocumentVersionAudit = async (documentGuid, version, action, auditTrailId) => {
	await databaseConnector.documentVersionAudit.create({
		data: {
			documentGuid,
			version,
			action,
			auditTrailId
		}
	});
};

/**
 * @param {any} tx
 * @param {string} documentGuid
 * @param {number} version
 */
const deleteVersion = async (tx, documentGuid, version) => {
	await tx.documentVersion.update({
		where: { documentGuid_version: { documentGuid, version } },
		data: { isDeleted: true }
	});
};

/**
 * @param {any} tx
 * @param {string} documentGuid
 * @param {string} name
 */
const deleteDocument = async (tx, documentGuid, name) => {
	await tx.document.update({
		where: { guid: documentGuid },
		data: {
			isDeleted: true,
			name: `_${randomUUID()}_${name}`
		}
	});
};

/**
 * @param {any} tx
 * @param {Document} document
 * @param {number} version
 */
const setPreviousVersion = async (tx, document, version) => {
	const versions = document.versions?.filter((v) => !v.isDeleted).map((v) => v.version);

	if (!versions) {
		return;
	}
	const previousVersion = findPreviousVersion(versions, version);
	if (previousVersion) {
		await tx.document.update({
			where: { guid: document.guid },
			data: { latestVersionId: previousVersion }
		});
	}
};
