import { PromisePool } from '@supercharge/promise-pool/dist/promise-pool.js';
import logger from '#utils/logger.js';
import config from '#config/config.js';
import {
	mapDocumentsForDatabase,
	mapDocumentsForBlobStorage,
	mapDocumentsForAuditTrail
} from './documents.mapper.js';
import { getByCaseId, getByCaseIdAndPaths, getById } from '#repositories/folder.repository.js';
import {
	addDocument,
	addDocumentVersion,
	deleteDocumentVersion,
	addDocumentVersionAudit
} from '#repositories/document-metadata.repository.js';
import { formatFolder } from './documents.formatter.js';
import documentRedactionStatusRepository from '#repositories/document-redaction-status.repository.js';
import { ERROR_NOT_FOUND } from '#endpoints/constants.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { EventType } from '@pins/event-client';
import {
	APPEAL_CASE_STAGE,
	APPEAL_VIRUS_CHECK_STATUS,
	APPEAL_CASE_STATUS,
	APPEAL_DOCUMENT_TYPE
} from 'pins-data-model';
import { validateBlobContents } from '#utils/blob-validation.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/** @typedef {import('@pins/appeals.api').Schema.AuditTrail} AuditTrail */
/** @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo */
/** @typedef {import('@pins/appeals/index.js').AddDocumentsRequest} AddDocumentsRequest */
/** @typedef {import('@pins/appeals/index.js').AddDocumentVersionRequest} AddDocumentVersionRequest */
/** @typedef {import('@pins/appeals/index.js').AddDocumentsResponse} AddDocumentsResponse */

/**
 * @param {number} appealId
 * @param {string} folderId
 * @param {number|null} repId
 * @returns {Promise<FolderInfo | null>}
 */
export const getFolderForAppeal = async (appealId, folderId, repId) => {
	const folder = await getById(Number(folderId));
	if (!folder) {
		return null;
	}

	if (repId) {
		const attachments = folder?.documents
			.filter(
				(doc) =>
					doc.latestDocumentVersion?.representation != null &&
					doc.latestDocumentVersion?.representation.representationId === repId
			)
			.map((doc) => {
				const docFriendlyName = doc.name.replace(/[a-f\d-]{36}_/, '');
				return {
					...doc,
					name: docFriendlyName,
					latestDocumentVersion: {
						...doc.latestDocumentVersion,
						fileName: docFriendlyName
					}
				};
			});

		return (
			formatFolder({
				...folder,
				// @ts-ignore
				documents: attachments
			}) || null
		);
	}
	if (folder && folder.caseId === appealId) {
		return formatFolder(folder) || null;
	}

	return null;
};

/**
 * @param {number} appealId
 * @param {string} path
 * @returns {Promise<FolderInfo[]>}
 * */
export const getFolderByPath = async (appealId, path) => {
	const folders = await getByCaseIdAndPaths(appealId, [path]);
	const formatted = /** @type {FolderInfo[]} */ (folders.map(formatFolder).filter(Boolean));

	return formatted;
};

/**
 * @param {number} appealId
 * @param {string?} stage
 * @returns {Promise<Folder[]>}
 */
export const getFoldersForAppeal = async (appealId, stage = null) => {
	if (stage && stage != null) {
		const paths = getFoldersForStage(stage);
		return await getByCaseIdAndPaths(appealId, paths);
	}

	return await getByCaseId(appealId);
};

/**
 * @param {number} appealId
 * @returns {Promise<Folder[]>}
 */
export const getRootFoldersForAppeal = async (appealId) => {
	return await getByCaseIdAndPaths(appealId, [
		`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION}`,
		`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_WITHDRAWAL}`,
		`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_CORRESPONDENCE}`,
		`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_APPLICATION}`,
		`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_WITHDRAWAL}`,
		`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_CORRESPONDENCE}`,
		`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.COSTS_DECISION_LETTER}`,
		`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER}`,
		`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.CROSS_TEAM_CORRESPONDENCE}`,
		`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.INSPECTOR_CORRESPONDENCE}`,
		`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.UNCATEGORISED}`,
		`${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
	]);
};

/**
 * @param {string} path
 * @returns {string[]}
 */
export const getFoldersForStage = (path) => {
	const stage = path.indexOf('/') > -1 ? path.split('/')[0] : path;

	/**
	 * @type {string[]}
	 */
	let folders;
	switch (stage) {
		case APPEAL_CASE_STAGE.APPELLANT_CASE:
			folders = [
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_STATEMENT}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.ORIGINAL_APPLICATION_FORM}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.CHANGED_DESCRIPTION}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_CORRESPONDENCE}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.NEW_PLANS_DRAWINGS}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.PLANNING_OBLIGATION}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.OWNERSHIP_CERTIFICATE}`,
				`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS}`
			];
			break;
		case APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE:
			folders = [
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_SITE_NOTICE}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_LETTER_TO_NEIGHBOURS}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_PRESS_ADVERT}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.CONSERVATION_MAP}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.OTHER_PARTY_REPRESENTATIONS}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.PLANNING_OFFICER_REPORT}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.DEVELOPMENT_PLAN_POLICIES}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.TREE_PRESERVATION_PLAN}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.DEFINITIVE_MAP_STATEMENT}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.SUPPLEMENTARY_PLANNING}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EMERGING_PLAN}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.CONSULTATION_RESPONSES}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EIA_SCREENING_OPINION}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EIA_SCREENING_DIRECTION}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.LPA_CASE_CORRESPONDENCE}`,
				`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.OTHER_RELEVANT_POLICIES}`
			];
			break;
		case APPEAL_CASE_STAGE.COSTS:
			folders = [
				`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION}`,
				`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_WITHDRAWAL}`,
				`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_CORRESPONDENCE}`,
				`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_APPLICATION}`,
				`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_WITHDRAWAL}`,
				`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_CORRESPONDENCE}`,
				`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.COSTS_DECISION_LETTER}`
			];
			break;
		case 'internal':
			folders = [
				`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.CROSS_TEAM_CORRESPONDENCE}`,
				`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.INSPECTOR_CORRESPONDENCE}`,
				`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.UNCATEGORISED}`
			];
			break;
		case APPEAL_CASE_STAGE.APPEAL_DECISION:
			folders = [
				`${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
			];
			break;
		default:
			folders = [`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.UNCATEGORISED}`];
	}

	return folders;
};

/**
 * @param {AddDocumentsRequest} upload
 * @param {Appeal} appeal
 * @returns {Promise<AddDocumentsResponse>}}
 */
export const addDocumentsToAppeal = async (upload, appeal) => {
	const { blobStorageHost, blobStorageContainer, documents } = upload;
	const documentsToSendToDatabase = mapDocumentsForDatabase(
		appeal.id,
		blobStorageHost ?? config.BO_BLOB_STORAGE_ACCOUNT,
		blobStorageContainer ?? config.BO_BLOB_CONTAINER,
		documents
	);

	const blobValidation = await validateBlobContents(
		appeal.reference,
		documentsToSendToDatabase.map((doc) => doc.blobStoragePath ?? '')
	);

	if (!blobValidation) {
		throw new Error(`Invalid blobs submitted`);
	}

	const documentsCreated = await addDocumentAndVersion(
		appeal.id,
		appeal.reference,
		appeal.appealStatus[0].status,
		documentsToSendToDatabase
	);

	for (const document of documentsCreated) {
		if (document?.documentGuid) {
			await broadcasters.broadcastDocument(document.documentGuid, 1, EventType.Create);
		}
	}

	const documentsToAddToAuditTrail = mapDocumentsForAuditTrail(documentsCreated).filter(
		(d) => d !== null
	);

	return {
		documents: documentsToAddToAuditTrail
	};
};

/**
 * @param {number} caseId
 * @param {string} reference
 * @param {string} appealStatus
 * @param {*[]} documents
 * @returns {Promise<(DocumentVersion | null)[]>}
 */
const addDocumentAndVersion = async (caseId, reference, appealStatus, documents) => {
	const { results } = await PromisePool.withConcurrency(5)
		.for(documents)
		.handleError((error, document) => {
			logger.error(`Error while upserting document name "${document.name}" to database: ${error}`);
			throw error;
		})
		.process(async (d) => {
			const document = await addDocument(
				{
					GUID: d.GUID,
					originalFilename: d.name,
					mime: d.mime,
					documentType: d.documentType,
					stage: d.stage,
					size: d.documentSize,
					version: 1,
					blobStorageContainer: d.blobStorageContainer,
					blobStoragePath: d.blobStoragePath,
					documentURI: d.documentURI,
					dateReceived: d.dateReceived,
					redactionStatusId: d.redactionStatusId,
					isLateEntry: isLateEntry(d.stage, appealStatus)
				},
				{
					caseId,
					reference,
					folderId: Number(d.folderId),
					blobStorageHost: d.blobStorageHost
				}
			);

			if (!document) {
				logger.error(`Error adding document named: ${d.name}`);
				throw new Error(
					`Error adding document named: ${d.name} in folder ${d.folderId} for appeal ${d.caseId}`
				);
			}
			logger.info(`Added document with guid: ${document.documentGuid}`);

			return document;
		});

	logger.info(`Added ${results.length} documents to database`);

	return results;
};

/**
 * @param {AddDocumentVersionRequest} upload
 * @param {Appeal} appeal
 * @param {Document} document
 * @returns {Promise<*>}}
 */
export const addVersionToDocument = async (upload, appeal, document) => {
	if (!document || document.isDeleted) {
		throw new Error('Document not found');
	}

	const { blobStorageHost, blobStorageContainer, document: uploadedDocument } = upload;
	const documentToSendToDatabase = mapDocumentsForDatabase(
		appeal.id,
		blobStorageHost,
		blobStorageContainer,
		[uploadedDocument]
	)[0];

	const blobValidation = await validateBlobContents(appeal.reference, [
		documentToSendToDatabase.blobStoragePath ?? ''
	]);

	if (!blobValidation) {
		throw new Error(`Invalid blobs submitted`);
	}

	const documentVersionCreated = await addDocumentVersion({
		documentGuid: document.guid,
		fileName: document.name,
		originalFilename: documentToSendToDatabase.name,
		mime: documentToSendToDatabase.mime,
		size: documentToSendToDatabase.documentSize,
		stage: documentToSendToDatabase.stage,
		documentType: documentToSendToDatabase.documentType,
		version: 1,
		blobStorageContainer: documentToSendToDatabase.blobStorageContainer,
		blobStoragePath: documentToSendToDatabase.blobStoragePath,
		documentURI: documentToSendToDatabase.documentURI,
		dateReceived: documentToSendToDatabase.dateReceived,
		redactionStatusId: documentToSendToDatabase.redactionStatusId,
		isLateEntry: isLateEntry(documentToSendToDatabase.stage, appeal.appealStatus[0].status)
	});

	if (!documentVersionCreated) {
		return {
			documents: []
		};
	}

	await broadcasters.broadcastDocument(
		document.guid,
		documentVersionCreated.version,
		EventType.Update
	);

	const documentsToAddToBlobStorage = mapDocumentsForBlobStorage(
		[documentVersionCreated],
		appeal.reference,
		documentVersionCreated.version
	).filter((d) => d !== null);

	return {
		documents: documentsToAddToBlobStorage
	};
};

/**
 * @returns {Promise<number[]>}
 */
export const getDocumentRedactionStatusIds = async () => {
	const redactionStatuses =
		await documentRedactionStatusRepository.getAllDocumentRedactionStatuses();

	if (!redactionStatuses.length) {
		throw new Error(ERROR_NOT_FOUND);
	}

	return redactionStatuses.map(({ id }) => Number(id));
};

/**
 *
 * @param {DocumentVersion} documentVersion
 * @returns {string}
 */
export const getAvScanStatus = (documentVersion) => {
	return documentVersion.virusCheckStatus || APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED;
};

/**
 * @param { Document } document
 * @param { number } version
 * @returns {Promise<boolean>}
 */
export const deleteDocument = async (document, version) => {
	const result = await deleteDocumentVersion(document.guid, version);
	await broadcasters.broadcastDocument(document.guid, version, EventType.Delete);
	return result !== null;
};

/**
 * @param { string } guid
 * @param { number } version
 * @param { AuditTrail } auditTrail
 * @param { string } action
 */
export const addDocumentAudit = async (guid, version, auditTrail, action) => {
	await addDocumentVersionAudit(guid, version, action, auditTrail.id);
};

/**
 * @param { string } stage
 * @param { string } status
 * @return { boolean }
 */
const isLateEntry = (stage, status) => {
	switch (stage) {
		case APPEAL_CASE_STAGE.APPELLANT_CASE:
			return (
				status !== APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER &&
				status !== APPEAL_CASE_STATUS.VALIDATION &&
				status !== APPEAL_CASE_STATUS.READY_TO_START
			);

		case APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE:
			return (
				status !== APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER &&
				status !== APPEAL_CASE_STATUS.VALIDATION &&
				status !== APPEAL_CASE_STATUS.READY_TO_START &&
				status !== APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
			);
	}

	return false;
};
