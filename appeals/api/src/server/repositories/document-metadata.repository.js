import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { databaseConnector } from '#utils/database-connector.js';
import { findPreviousVersion } from '#utils/find-previous-version.js';
import logger from '#utils/logger.js';
import { EventType } from '@pins/event-client';
import { APPEAL_VIRUS_CHECK_STATUS } from '@planning-inspectorate/data-model';
import { randomUUID } from 'node:crypto';

/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} RedactionStatus */

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
 * @property {EventType} eventType
 * @property {number} version
 */

/**
 * @param {string} documentGuid
 * @param {number} version
 */
export const deleteDocumentVersion = async (documentGuid, version) => {
	/** @type {BroadcastEvent | null} */
	let broadcastEvent = null;
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
			documentVersion: []
		};
	});

	if (result && broadcastEvent) {
		const { version, eventType } = broadcastEvent;
		await broadcasters.broadcastDocument(documentGuid, version, eventType);
	}

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
