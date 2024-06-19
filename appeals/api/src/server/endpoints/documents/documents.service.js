import { PromisePool } from '@supercharge/promise-pool/dist/promise-pool.js';
import logger from '#utils/logger.js';
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
import { ERROR_NOT_FOUND, STATUSES } from '#endpoints/constants.js';
import { STAGE } from '@pins/appeals/constants/documents.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { EventType } from '@pins/event-client';
import { AVSCAN_STATUS } from '@pins/appeals/constants/documents.js';
import { DOCTYPE } from '@pins/appeals/constants/documents.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/** @typedef {import('@pins/appeals.api').Schema.AuditTrail} AuditTrail */
/** @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo */
/** @typedef {import('@pins/appeals/index.js').AddDocumentsRequest} AddDocumentsRequest */
/** @typedef {import('@pins/appeals/index.js').AddDocumentVersionRequest} AddDocumentVersionRequest */
/** @typedef {import('@pins/appeals/index.js').AddDocumentsResponse} AddDocumentsResponse */
/** @typedef {import('@pins/appeals/index.js').AddDocumentVersionResponse} AddDocumentVersionResponse */
/** @typedef {import('@pins/appeals/index.js').DocumentMetadata} DocumentMetadata */

/**
 * @param {Appeal} appeal
 * @param {string} folderId
 * @returns {Promise<FolderInfo | null>}
 */
export const getFolderForAppeal = async (appeal, folderId) => {
	const folder = await getById(Number(folderId));
	if (folder && folder.caseId === appeal.id) {
		return formatFolder(folder) || null;
	}

	return null;
};

/**
 * @param {Appeal} appeal
 * @param {string?} stage
 * @returns {Promise<Folder[]>}
 */
export const getFoldersForAppeal = async (appeal, stage = null) => {
	if (stage && stage != null) {
		const paths = getFoldersForStage(stage);
		return await getByCaseIdAndPaths(appeal.id, paths);
	}

	return await getByCaseId(appeal.id);
};

/**
 *
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
		case STAGE.APPELLANT_CASE:
			folders = [
				`${STAGE.APPELLANT_CASE}/${DOCTYPE.APPELLANT_STATEMENT}`,
				`${STAGE.APPELLANT_CASE}/${DOCTYPE.ORIGINAL_APPLICATION_FORM}`,
				`${STAGE.APPELLANT_CASE}/${DOCTYPE.APPLICATION_DECISION}`,
				`${STAGE.APPELLANT_CASE}/${DOCTYPE.CHANGED_DESCRIPTION}`,
				`${STAGE.APPELLANT_CASE}/${DOCTYPE.APPELLANT_CASE_WITHDRAWAL}`,
				`${STAGE.APPELLANT_CASE}/${DOCTYPE.APPELLANT_CASE_CORRESPONDENCE}`
			];
			break;
		case STAGE.LPA_QUESTIONNAIRE:
			folders = [
				`${STAGE.LPA_QUESTIONNAIRE}/${DOCTYPE.WHO_NOTIFIED}`,
				`${STAGE.LPA_QUESTIONNAIRE}/${DOCTYPE.CONSERVATION_MAP}`,
				`${STAGE.LPA_QUESTIONNAIRE}/${DOCTYPE.OTHER_PARTY_REPS}`,
				`${STAGE.LPA_QUESTIONNAIRE}/${DOCTYPE.PLANNING_OFFICER_REPORT}`,
				`${STAGE.LPA_QUESTIONNAIRE}/${DOCTYPE.LPA_CASE_CORRESPONDENCE}`
			];
			break;
		case STAGE.COSTS:
			folders = [
				`${STAGE.COSTS}/appellant`,
				`${STAGE.COSTS}/lpa`,
				`${STAGE.COSTS}/decision`
				// `${STAGE.COSTS}/${DOCTYPE.APPELLANT_COST_APPLICATION}`,
				// `${STAGE.COSTS}/${DOCTYPE.APPELLANT_COST_WITHDRAWAL}`,
				// `${STAGE.COSTS}/${DOCTYPE.APPELLANT_COST_CORRESPONDENCE}`,
				// `${STAGE.COSTS}/${DOCTYPE.LPA_COST_APPLICATION}`,
				// `${STAGE.COSTS}/${DOCTYPE.LPA_COST_WITHDRAWAL}`,
				// `${STAGE.COSTS}/${DOCTYPE.LPA_COST_CORRESPONDENCE}`,
				// `${STAGE.COSTS}/${DOCTYPE.COST_DECISION_LETTER}`
			];
			break;
		case STAGE.INTERNAL:
			folders = [
				`${STAGE.INTERNAL}/${DOCTYPE.CROSS_TEAM_CORRESPONDENCE}`,
				`${STAGE.INTERNAL}/${DOCTYPE.INSPECTOR_CORRESPONDENCE}`,
				`${STAGE.INTERNAL}/${DOCTYPE.DROPBOX}`
			];
			break;
		case STAGE.APPEAL_DECISION:
			folders = [`${STAGE.APPEAL_DECISION}/${DOCTYPE.CASE_DECISION_LETTER}`];
			break;
		default:
			folders = [`${STAGE.INTERNAL}/${DOCTYPE.DROPBOX}`];
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
		blobStorageHost,
		blobStorageContainer,
		documents
	);
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
 * @param {DocumentMetadata[]} documents
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
 * @returns {Promise<AddDocumentVersionResponse>}}
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
 * @returns
 */
export const getAvScanStatus = (documentVersion) => {
	return documentVersion.virusCheckStatus || AVSCAN_STATUS.NOT_SCANNED;
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
		case STAGE.APPELLANT_CASE:
			return (
				status !== STATUSES.STATE_TARGET_ASSIGN_CASE_OFFICER &&
				status !== STATUSES.STATE_TARGET_VALIDATION &&
				status !== STATUSES.STATE_TARGET_READY_TO_START
			);

		case STAGE.LPA_QUESTIONNAIRE:
			return (
				status !== STATUSES.STATE_TARGET_ASSIGN_CASE_OFFICER &&
				status !== STATUSES.STATE_TARGET_VALIDATION &&
				status !== STATUSES.STATE_TARGET_READY_TO_START &&
				status !== STATUSES.STATE_TARGET_LPA_QUESTIONNAIRE_DUE
			);
	}

	return false;
};
