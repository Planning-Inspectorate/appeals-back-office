import { databaseConnector } from '#utils/database-connector.js';
import {
	APPEAL_VIRUS_CHECK_STATUS,
	APPEAL_REDACTED_STATUS
} from '@planning-inspectorate/data-model';
import documentRedactionStatusRepository from '#repositories/document-redaction-status.repository.js';

/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentsRequest} UpdateDocumentsRequest */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentFileNameRequest} UpdateDocumentFileNameRequest */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentAvCheckRequest} UpdateDocumentAvCheckRequest */

/**
 * @param {string} guid
 * @returns {PrismaPromise<Document|null>}
 */
export const getDocumentById = (guid) => {
	return databaseConnector.document.findUnique({
		where: { guid },
		include: {
			latestDocumentVersion: {
				include: {
					redactionStatus: true
				}
			}
		}
	});
};

/**
 * @param {string[]} guids
 * @returns {Promise<Document[]>}
 * */
export const getDocumentsByIds = (guids) =>
	Promise.all(
		guids.map(async (guid) => {
			const doc = await getDocumentById(guid);
			if (!doc) {
				throw new Error(`no document found with guid: ${guid}`);
			}

			return doc;
		})
	);

/**
 * @param {string} guid
 * @param {Number} version
 * @returns {PrismaPromise<Document|null>}
 */
export const getDocumentByIdAndVersion = (guid, version) => {
	return databaseConnector.document.findUnique({
		where: { guid },
		include: {
			versions: {
				where: {
					version
				}
			}
		}
	});
};

/**
 * @param {string} guid
 * @returns {PrismaPromise<Document|null>}
 */
export const getDocumentWithAllVersionsById = (guid) => {
	// @ts-ignore
	return databaseConnector.document.findUnique({
		where: { guid },
		include: {
			latestDocumentVersion: {
				include: {
					redactionStatus: true
				}
			},
			versions: {
				include: {
					redactionStatus: true
				}
			},
			versionAudit: {
				include: {
					auditTrail: {
						include: {
							user: true
						}
					}
				}
			}
		}
	});
};

/**
 * @param {number} caseId
 * @returns {PrismaPromise<Document[]>}
 */
export const getDocumentsByAppealId = (caseId) => {
	// @ts-ignore
	return databaseConnector.document.findMany({
		where: {
			isDeleted: false,
			caseId
		},
		include: {
			latestDocumentVersion: {
				include: {
					redactionStatus: true
				}
			}
		}
	});
};

/**
 * @param {{folderId: number, skipValue: number, pageSize: number, documentVersion?: number}} folderId
 * @returns {PrismaPromise<Document[]>}
 */
export const getDocumentsInFolder = ({ folderId, skipValue, pageSize }) => {
	return databaseConnector.document.findMany({
		where: { folderId },
		orderBy: [{ createdAt: 'desc' }],
		skip: skipValue,
		take: pageSize,
		include: {
			latestDocumentVersion: {
				include: {
					redactionStatus: true
				}
			}
		}
	});
};

/**
 * @param {UpdateDocumentsRequest} data
 * @returns
 */
export const updateDocuments = (data) => {
	const queries = data.map((document) =>
		databaseConnector.documentVersion.update({
			data: {
				dateReceived: document.receivedDate,
				redactionStatus: {
					connect: {
						id: document.redactionStatus
					}
				},
				published: document.published,
				draft: false
			},
			where: {
				documentGuid_version: { documentGuid: document.id, version: document.latestVersion }
			}
		})
	);

	return Promise.all(queries);
};

/**
 * @param {string} documentId
 * @param {UpdateDocumentFileNameRequest} document
 * @returns
 */
export const updateDocumentById = (documentId, document) => {
	return databaseConnector.document.update({
		data: { name: document.fileName },
		where: {
			guid: documentId
		}
	});
};

/**
 * @param {number} appealId
 * @returns {Promise<{documentGuid: string, version: number}[]>}
 */
export const setRedactionStatusOnValidation = async (appealId) => {
	const documentsToUpdate = await databaseConnector.documentVersion.findMany({
		where: {
			AND: [
				{
					redactionStatusId: null
				},
				{
					document: {
						caseId: appealId
					}
				}
			]
		},
		include: {
			document: true
		}
	});

	const redactionStatuses =
		await documentRedactionStatusRepository.getAllDocumentRedactionStatuses();
	const noRedactionRequiredStatus = redactionStatuses.find(
		(redaction) => redaction.key === APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED
	);

	if (!noRedactionRequiredStatus) {
		throw new Error('No redaction status found for no redaction required');
	}

	for (const documentToUpdate of documentsToUpdate) {
		await databaseConnector.documentVersion.update({
			where: {
				documentGuid_version: {
					documentGuid: documentToUpdate.documentGuid,
					version: documentToUpdate.version
				}
			},
			data: {
				redactionStatusId: noRedactionRequiredStatus.id
			}
		});
	}

	return documentsToUpdate.map((document) => ({
		documentGuid: document.documentGuid,
		version: document.version
	}));
};

/**
 * @param {UpdateDocumentAvCheckRequest[]} data
 * @returns
 */
export const createDocumentAvStatus = (data) =>
	Promise.all(
		data.map((document) =>
			databaseConnector.documentVersionAvScan.upsert({
				create: {
					documentGuid: document.id,
					version: document.version,
					avScanSuccess: document.virusCheckStatus === APPEAL_VIRUS_CHECK_STATUS.SCANNED
				},
				update: {
					avScanSuccess: document.virusCheckStatus === APPEAL_VIRUS_CHECK_STATUS.SCANNED
				},
				where: {
					documentGuid_version: {
						documentGuid: document.id,
						version: document.version
					}
				}
			})
		)
	);

/**
 * @param {UpdateDocumentAvCheckRequest} document
 * @returns
 */
export const updateDocumentAvStatus = (document) =>
	databaseConnector.documentVersion.update({
		data: {
			virusCheckStatus: document.virusCheckStatus
		},
		where: {
			documentGuid_version: {
				documentGuid: document.id,
				version: document.version
			}
		}
	});
