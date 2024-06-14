import { databaseConnector } from '#utils/database-connector.js';
import { AVSCAN_STATUS } from '@pins/appeals/constants/documents.js';

/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentsRequest} UpdateDocumentsRequest */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentsAvCheckRequest} UpdateDocumentsAvCheckRequest */

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
					avScan: true,
					redactionStatus: true
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
					avScan: true,
					redactionStatus: true
				}
			},
			versions: {
				include: {
					avScan: true,
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
					avScan: true,
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
					avScan: true,
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
export const updateDocuments = (data) =>
	Promise.all(
		data.map((document) =>
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
		)
	);

/**
 * @param {UpdateDocumentsAvCheckRequest} data
 * @returns
 */
export const updateDocumentAvStatus = (data) =>
	Promise.all(
		data.map((document) =>
			databaseConnector.documentVersionAvScan.create({
				data: {
					documentGuid: document.id,
					version: document.version,
					avScanSuccess: document.virusCheckStatus === AVSCAN_STATUS.SCANNED
				}
			})
		)
	);
