import { databaseConnector } from '#utils/database-connector.js';
import { APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';

/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentsRequest} UpdateDocumentsRequest */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentsAvCheckRequest} UpdateDocumentAvCheckRequest */

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
