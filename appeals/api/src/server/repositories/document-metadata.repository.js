import { databaseConnector } from '#utils/database-connector.js';
import { findPreviousVersion } from '#utils/find-previous-version.js';
import logger from '#utils/logger.js';
import { EventType } from '@pins/event-client';
import { APPEAL_VIRUS_CHECK_STATUS } from '@planning-inspectorate/data-model';
import { randomUUID } from 'node:crypto';

/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} RedactionStatus */

const BULK_DOCUMENTS_CHUNK_SIZE = 100;

/**
 * @typedef {Object} BulkDocumentMetadata
 * @property {string} guid
 * @property {string} originalFilename
 * @property {string} fileName
 * @property {number} caseId
 * @property {number} folderId
 * @property {string|undefined} mime
 * @property {string|undefined} documentType
 * @property {string|undefined} stage
 * @property {number|undefined} size
 * @property {string|undefined} blobStorageContainer
 * @property {string|undefined} blobStoragePath
 * @property {string|undefined} documentURI
 * @property {Date|string|undefined} dateReceived
 * @property {string|undefined} virusCheckStatus
 * @property {number|null|undefined} redactionStatusId
 * @property {boolean} isLateEntry
 */

/**
 * @param {any} metadata
 * @param {any} context
 * @returns {Promise<DocumentVersion | null>}
 */
export const addDocument = async (metadata, context) => {
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
		metadata.fileName = name || metadata.originalFilename;
		if (!metadata.virusCheckStatus) {
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
		}

		delete metadata.GUID;

		const documentVersion = await tx.documentVersion.create({
			data: {
				...metadata,
				lastModified: new Date(),
				dateReceived: metadata.dateReceived ?? new Date().toISOString(),
				redactionStatusId: metadata.redactionStatusId ?? null,
				published: false,
				draft: false
			}
		});

		await tx.document.update({
			data: { latestVersionId: documentVersion.version },
			where: { guid }
		});

		const latestVersion = await tx.documentVersion.findFirst({
			include: { document: true, redactionStatus: true },
			where: { documentGuid: guid, version: metadata.version }
		});

		return latestVersion;
	});

	return transaction;
};

/**
 * Creates document metadata in bulk using chunked createMany operations and returns
 * the created version rows in input order.
 *
 * @param {BulkDocumentMetadata[]} documents
 * @returns {Promise<(DocumentVersion | null)[]>}
 */
export const addDocumentsBulk = async (documents) => {
	if (!documents.length) {
		return [];
	}

	const chunks = chunkDocuments(documents, BULK_DOCUMENTS_CHUNK_SIZE);
	const allGuids = documents.map((document) => document.guid);
	const now = new Date();

	const createdVersions = await databaseConnector.$transaction(async (tx) => {
		for (const chunk of chunks) {
			await tx.document.createMany({
				data: chunk.map((document) => ({
					guid: document.guid,
					caseId: document.caseId,
					folderId: document.folderId,
					name: document.originalFilename
				}))
			});

			const pendingScanGuids = chunk
				.filter((document) => !document.virusCheckStatus)
				.map((document) => document.guid);

			/** @type {Map<string, string>} */
			const virusCheckStatusByGuid = new Map();
			if (pendingScanGuids.length) {
				const scanResults = await tx.documentVersionAvScan.findMany({
					where: {
						documentGuid: { in: pendingScanGuids },
						version: 1
					}
				});

				for (const scanResult of scanResults) {
					virusCheckStatusByGuid.set(
						scanResult.documentGuid,
						scanResult.avScanSuccess === true
							? APPEAL_VIRUS_CHECK_STATUS.SCANNED
							: APPEAL_VIRUS_CHECK_STATUS.AFFECTED
					);
				}
			}

			await tx.documentVersion.createMany({
				data: chunk.map((document) => ({
					documentGuid: document.guid,
					version: 1,
					lastModified: now,
					documentType: document.documentType,
					published: false,
					draft: false,
					virusCheckStatus:
						document.virusCheckStatus ??
						virusCheckStatusByGuid.get(document.guid) ??
						APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED,
					originalFilename: document.originalFilename,
					fileName: document.fileName,
					mime: document.mime,
					size: document.size,
					stage: document.stage,
					blobStorageContainer: document.blobStorageContainer,
					blobStoragePath: document.blobStoragePath,
					documentURI: document.documentURI,
					dateReceived: document.dateReceived ?? now,
					isLateEntry: document.isLateEntry,
					redactionStatusId: document.redactionStatusId ?? null
				}))
			});

			await tx.document.updateMany({
				where: { guid: { in: chunk.map((document) => document.guid) } },
				data: { latestVersionId: 1 }
			});
		}

		return tx.documentVersion.findMany({
			include: { document: true, redactionStatus: true },
			where: {
				documentGuid: { in: allGuids },
				version: 1
			}
		});
	});

	const versionsByGuid = new Map(
		createdVersions.map((documentVersion) => [documentVersion.documentGuid, documentVersion])
	);

	return allGuids.map((guid) => versionsByGuid.get(guid) || null);
};

/**
 * @param {any} params
 * @returns {Promise<DocumentVersion | null>}
 */
export const addDocumentVersion = async (params) => {
	const { documentGuid, ...metadata } = params;
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
				redactionStatusId: metadata.redactionStatusId ?? null,
				published: false,
				draft: false
			}
		});

		await tx.document.update({
			data: { latestVersionId: newVersionId },
			where: { guid: documentGuid }
		});

		const latestVersion = await tx.documentVersion.findFirst({
			include: { document: true, redactionStatus: true },
			where: { documentGuid, version: newVersionId }
		});

		return latestVersion;
	});

	// @ts-ignore
	return transaction;
};

/**
 * @typedef {Object} BroadcastEvent
 * @property {EventType | null} eventType
 * @property {number} version
 */

/**
 * @param {string} documentGuid
 * @param {number} version
 * @returns {Promise< (Document & BroadcastEvent) | null>}
 */
export const deleteDocumentVersion = async (documentGuid, version) => {
	/** @type {BroadcastEvent} */
	let broadcastEvent = { eventType: null, version };
	const result = await databaseConnector.$transaction(async (tx) => {
		const document = await tx.document.findFirst({
			include: {
				versions: true,
				latestDocumentVersion: true
			},
			where: { guid: documentGuid }
		});

		if (!document || !document.latestDocumentVersion || !document.versions) {
			return null;
		}

		const versionToDelete = document.versions.find((v) => v.version === version);
		const versionCount = document.versions.filter((v) => !v.isDeleted).length;

		if (!versionToDelete) {
			return null;
		}

		if (versionToDelete.version !== document.latestDocumentVersion.version) {
			await deleteVersion(tx, document.guid, versionToDelete.version);
		} else {
			if (versionCount === 1) {
				await deleteVersion(tx, document.guid, versionToDelete.version);
				await deleteDocument(tx, document.guid, document.name);
				broadcastEvent = { eventType: EventType.Delete, version };
			} else {
				// @ts-ignore
				await setPreviousVersion(tx, document, versionToDelete.version);
				await deleteVersion(tx, document.guid, versionToDelete.version);

				const newLatestVersion = findPreviousVersion(
					document.versions.filter((v) => !v.isDeleted).map((v) => v.version),
					versionToDelete.version
				);

				if (newLatestVersion) {
					broadcastEvent = { eventType: EventType.Update, version: newLatestVersion };
				}
			}
		}

		return {
			...document,
			isDeleted: versionCount === 1,
			latestDocumentVersion: null,
			latestVersionId: null,
			documentVersion: [],
			...broadcastEvent
		};
	});

	return result;
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

/**
 * @param {any} tx
 * @param {string} documentGuid
 * @param {string} name
 */
export const deleteDocumentAndVersions = async (tx, documentGuid, name) => {
	logger.debug(`Deleting: ${name}`);
	await deleteDocument(tx, documentGuid, name);
	await tx.documentVersion.updateMany({
		where: { documentGuid },
		data: { isDeleted: true }
	});
};

/**
 * @template T
 * @param {T[]} documents
 * @param {number} chunkSize
 * @returns {T[][]}
 */
const chunkDocuments = (documents, chunkSize) => {
	/** @type {T[][]} */
	const chunks = [];
	for (let index = 0; index < documents.length; index += chunkSize) {
		chunks.push(documents.slice(index, index + chunkSize));
	}

	return chunks;
};
