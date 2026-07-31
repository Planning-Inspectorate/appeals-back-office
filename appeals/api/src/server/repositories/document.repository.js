import documentRedactionStatusRepository from '#repositories/document-redaction-status.repository.js';
import { databaseConnector } from '#utils/database-connector.js';
import {
	APPEAL_REDACTED_STATUS,
	APPEAL_VIRUS_CHECK_STATUS
} from '@planning-inspectorate/data-model';

/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentsRequest} UpdateDocumentsRequest */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentRequest} UpdateDocumentRequest */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentAvCheckRequest} UpdateDocumentAvCheckRequest */
/** @typedef {import('#db-client/models.ts').AppealModel} AppealModel */
/** @typedef {import('#db-client/models.ts').AppealTypeModel} AppealTypeModel */
/** @typedef {import('#db-client/models.ts').DocumentModel} DocumentModel */
/** @typedef {import('#db-client/models.ts').DocumentVersionModel} DocumentVersionModel */
/** @typedef {import('#db-client/models.ts').RepresentationModel} RepresentationModel */

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
				where: {
					document: { isDeleted: false }
				},
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
 * @param {{folderId: number, documentVersion?: number}} param0
 * @returns {PrismaPromise<Document[]>}
 */
export const getDocumentsInFolder = ({ folderId }) => {
	return databaseConnector.document.findMany({
		where: { folderId, isDeleted: false },
		orderBy: [{ createdAt: 'desc' }],
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
 * @param {Document} latestDocument
 * @param {UpdateDocumentRequest['document']} document
 * @returns {Promise<Document>}
 */
export const updateDocument = (latestDocument, document) => {
	const { guid, latestDocumentVersion } = latestDocument;

	return databaseConnector.$transaction(async (tx) => {
		const documentResult = await tx.document.update({
			data: { name: document.fileName },
			where: {
				guid: guid
			}
		});

		// publish doc if isShared and not already published
		if (document.isShared && latestDocumentVersion && !latestDocumentVersion.published) {
			const redactionStatuses =
				await documentRedactionStatusRepository.getAllDocumentRedactionStatuses();
			const noRedactionRequiredStatus = redactionStatuses.find(
				(redaction) => redaction.key === APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED
			);

			/** @type {import('#db-client/client.ts').Prisma.DocumentVersionUpdateInput} */
			const update = {
				published: true,
				datePublished: new Date()
			};

			if (latestDocumentVersion.redactionStatusId === null) {
				update.redactionStatus = { connect: { id: noRedactionRequiredStatus?.id } };
			}

			await tx.documentVersion.update({
				data: update,
				where: {
					documentGuid_version: {
						documentGuid: guid,
						version: latestDocumentVersion.version
					}
				}
			});
		}

		return documentResult;
	});
};

/**
 * @typedef UpdateRedactionStatusResult
 * @property {DocumentModel['guid']} guid
 * @property {DocumentModel['name']} name
 * @property {DocumentVersionModel['version']} version
 * @property {DocumentVersionModel['documentURI']} documentURI
 * @property {DocumentVersionModel['originalFilename']} originalFilename
 * @property {DocumentVersionModel['size']} size
 * @property {DocumentVersionModel['mime']} mime
 * @property {DocumentVersionModel['fileMD5']} fileMD5
 * @property {DocumentVersionModel['virusCheckStatus']} virusCheckStatus
 * @property {DocumentVersionModel['stage']} stage
 * @property {DocumentVersionModel['documentType']} documentType
 * @property {DocumentVersionModel['published']} published
 * @property {DocumentVersionModel['datePublished']} datePublished
 * @property {DocumentVersionModel['dateCreated']} dateCreated
 * @property {DocumentVersionModel['dateReceived']} dateReceived
 * @property {DocumentVersionModel['lastModified']} lastModified
 * @property {RepresentationModel['representationType']} representationType

/**
 * @param {AppealModel['id']} appealId
 * @param {AppealModel['reference']} appealRef
 * @param {AppealTypeModel['key']} appealType
 * @param {{id: Number, key: String}|Null} redactionStatus
 * @returns {Promise<import('#mappers/integration/map-document-entity.js').DocumentWithAppeal[]>}
 */
export const setRedactionStatusOnValidation = async (
	appealId,
	appealRef,
	appealType,
	redactionStatus
) => {
	const redactionStatusId = redactionStatus ? redactionStatus.id : null;
	// can be 1000+ updates followed by a subsequent broadcast that looks them up
	// can be done in 1 action with $queryRaw
	/** @type {UpdateRedactionStatusResult[]} */
	const result = await databaseConnector.$queryRaw`UPDATE dv
		SET redactionStatusId = ${redactionStatusId}
		OUTPUT 
			 d.guid ,d.name
			,inserted.version ,inserted.documentURI ,inserted.originalFilename 
			,inserted.size ,inserted.mime ,inserted.fileMD5 ,inserted.virusCheckStatus
			,inserted.stage	,inserted.documentType ,inserted.published
			,inserted.datePublished	,inserted.dateCreated ,inserted.dateReceived ,inserted.lastModified
			,r.representationType
		FROM Document d
		JOIN DocumentVersion dv ON dv.documentGuid = d.guid	AND dv.version = d.latestVersionId
		LEFT JOIN RepresentationAttachment ra ON ra.documentGuid = dv.documentGuid AND ra.version = dv.version
		LEFT JOIN Representation r ON r.id = ra.representationId
		WHERE d.caseId = ${appealId} AND d.isDeleted = 0 AND dv.redactionStatusId IS NULL`;

	return result.map((doc) => ({
		guid: doc.guid,
		name: doc.name,
		caseId: appealId,
		case: {
			appealType: { key: appealType },
			reference: appealRef
		},
		versions: [
			{
				dateCreated: doc.dateCreated,
				dateReceived: doc.dateReceived,
				datePublished: doc.datePublished,
				documentType: doc.documentType,
				documentURI: doc.documentURI,
				fileMD5: doc.fileMD5,
				mime: doc.mime,
				originalFilename: doc.originalFilename,
				published: doc.published,
				...(redactionStatus
					? { redactionStatus: { key: redactionStatus.key } }
					: { redactionStatus: null }),
				stage: doc.stage,
				size: doc.size,
				version: doc.version,
				virusCheckStatus: doc.virusCheckStatus,
				lastModified: doc.lastModified,
				representation:
					doc.representationType !== null
						? { representation: { representationType: doc.representationType } }
						: null
			}
		]
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
