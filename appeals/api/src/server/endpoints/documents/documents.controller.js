import {
	AUDIT_TRAIL_DOCUMENT_DELETED,
	AUDIT_TRAIL_DOCUMENT_UPLOADED,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_FAILED_TO_ADD_DOCUMENTS,
	ERROR_DOCUMENT_NAME_ALREADY_EXISTS,
	ERROR_NOT_FOUND,
	AUDIT_TRAIL_DOCUMENT_REDACTED,
	AUDIT_TRAIL_DOCUMENT_UNREDACTED,
	AUDIT_TRAIL_DOCUMENT_NO_REDACTION_REQUIRED,
	AUDIT_TRAIL_DOCUMENT_DATE_CHANGED
} from '#endpoints/constants.js';
import logger from '#utils/logger.js';
import * as service from './documents.service.js';
import * as documentRepository from '#repositories/document.repository.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { formatDocument } from './documents.formatter.js';

/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/** @typedef {import('@pins/appeals.api').Schema.AuditTrail} AuditTrail */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getFolder = async (req, res) => {
	const { appeal } = req;
	const { folderId } = req.params;
	const folder = await service.getFolderForAppeal(appeal, folderId);

	return res.send(folder);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getDocument = async (req, res) => {
	const { document } = req;

	return res.send(formatDocument(document));
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getDocumentAndVersions = async (req, res) => {
	const { documentId } = req.params;
	const document = await documentRepository.getDocumentWithAllVersionsById(documentId);
	if (!document || document.isDeleted) {
		return res.status(404).send({ errors: { documentId: ERROR_NOT_FOUND } });
	}
	return res.send(formatDocument(document));
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const addDocuments = async (req, res) => {
	try {
		const { appeal } = req;
		const documentInfo = await service.addDocumentsToAppeal(req.body, appeal);

		/**
		 * @type {any}[]}
		 */
		const auditTrails = [];

		await Promise.all(
			documentInfo.documents.map(
				async (document) =>
					document &&
					(await auditTrails.push({
						guid: document.GUID,
						version: 1,
						audit: await createAuditTrail({
							appealId: appeal.id,
							azureAdUserId: req.get('azureAdUserId'),
							details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_UPLOADED, [
								document.documentName,
								1
							])
						})
					}))
			)
		);

		await Promise.all(
			auditTrails.map(
				(/** @type {{ guid: string; version: Number; audit: AuditTrail; }} */ auditTrail) =>
					auditTrail &&
					auditTrail.guid &&
					auditTrail.version &&
					auditTrail.audit &&
					service.addDocumentAudit(auditTrail.guid, Number(1), auditTrail.audit, 'Create')
			)
		);

		return res.send();
	} catch (/** @type {Object<any, any>} */ error) {
		if (error.code === 'P2002') {
			return res.status(409).send({
				errors: {
					body: {
						message: ERROR_DOCUMENT_NAME_ALREADY_EXISTS,
						fileName: error.meta.fileName
					}
				}
			});
		}

		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_ADD_DOCUMENTS } });
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const addDocumentVersion = async (req, res) => {
	const { appeal, body, document } = req;
	const documentInfo = await service.addVersionToDocument(body, appeal, document);
	const updatedDocument = documentInfo.documents[0];

	if (updatedDocument) {
		const auditTrail = await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId: req.get('azureAdUserId'),
			details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_UPLOADED, [
				updatedDocument.documentName,
				updatedDocument.versionId
			])
		});
		if (auditTrail) {
			await service.addDocumentAudit(
				document.guid,
				updatedDocument.versionId,
				auditTrail,
				'Create'
			);
		}

		return res.send(getStorageInfo(documentInfo.documents));
	}

	return res.sendStatus(404);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const deleteDocumentVersion = async (req, res) => {
	const { document } = req;
	const { version } = req.params;

	const documentInfo = await service.deleteDocument(document, Number(version));

	if (documentInfo) {
		const auditTrail = await createAuditTrail({
			appealId: document.caseId,
			azureAdUserId: req.get('azureAdUserId'),
			details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_DELETED, [document.name, version])
		});
		if (auditTrail) {
			await service.addDocumentAudit(document.guid, Number(version), auditTrail, 'Delete');
		}

		return res.send(documentInfo);
	}

	return res.sendStatus(404);
};

/**
 * @param {Request} req
 * @param {Response} res
 */
const updateDocuments = async (req, res) => {
	const { body, appeal } = req;
	const responseDocuments = [];

	try {
		const documents = body.documents;
		for (const document of documents) {
			const latestDocument = await documentRepository.getDocumentById(document.id);
			document.latestVersion = latestDocument?.latestDocumentVersion?.version;

			if (latestDocument && latestDocument.name) {
				if (document.redactionStatus !== latestDocument?.latestDocumentVersion?.redactionStatusId) {
					const auditTrailMessage = getAuditMessage(document.redactionStatus);
					if (auditTrailMessage) {
						await logAuditTrail(
							latestDocument.name,
							document.latestVersion,
							auditTrailMessage,
							req,
							appeal.id,
							latestDocument.guid
						);
					}
				}

				const receivedDate = document.receivedDate
					? new Date(document.receivedDate).toDateString()
					: null;
				const latestReceivedDate = latestDocument?.latestDocumentVersion?.dateReceived
					? new Date(latestDocument?.latestDocumentVersion?.dateReceived).toDateString()
					: null;

				if (receivedDate && latestReceivedDate && receivedDate !== latestReceivedDate) {
					const dateChangeMessage = AUDIT_TRAIL_DOCUMENT_DATE_CHANGED;
					await logAuditTrail(
						latestDocument.name,
						document.latestVersion,
						dateChangeMessage,
						req,
						appeal.id,
						latestDocument.guid
					);
				}
			}

			responseDocuments.push({
				id: document.id,
				latestVersion: document.latestVersion,
				redactionStatus: document.redactionStatus,
				receivedDate: document.receivedDate
			});
		}
		await documentRepository.updateDocuments(documents);
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	res.send({ documents: responseDocuments });
};

/**
 * @type {(docs: (*|null)[]) => object}
 */
const getStorageInfo = (docs) => {
	return {
		documents: docs.map((d) => {
			if (d) {
				return {
					documentName: d.documentName,
					GUID: d.GUID,
					blobStoreUrl: d.blobStoreUrl
				};
			}
		})
	};
};

/**
 * @param {number} redactionStatus
 * @returns {string|null}
 */
function getAuditMessage(redactionStatus) {
	switch (redactionStatus) {
		case 1:
			return AUDIT_TRAIL_DOCUMENT_REDACTED;
		case 2:
			return AUDIT_TRAIL_DOCUMENT_UNREDACTED;
		case 3:
			return AUDIT_TRAIL_DOCUMENT_NO_REDACTION_REQUIRED;
		default:
			return null;
	}
}

/**
 *
 * @param {string} documentName
 * @param {number} documentVersion
 * @param {string} messageKey
 * @param {Request} req
 * @param {number} appealId
 * @param {string} documentGuid
 * @param {string} action
 */
async function logAuditTrail(
	documentName,
	documentVersion,
	messageKey,
	req,
	appealId,
	documentGuid,
	action = 'Update'
) {
	const details = stringTokenReplacement(messageKey, [documentName, documentVersion]);

	const auditTrail = await createAuditTrail({
		appealId: appealId,
		azureAdUserId: req.get('azureAdUserId'),
		details: details
	});

	if (auditTrail) {
		await service.addDocumentAudit(documentGuid, documentVersion, auditTrail, action);
	}
}

/**
 * @param {Request} req
 * @param {Response} res
 */
const updateDocumentsAvCheckStatus = async (req, res) => {
	const { body } = req;
	const responseDocuments = [];

	try {
		const documents = body.documents;
		await documentRepository.createDocumentAvStatus(documents);

		for (const document of documents) {
			const latestDocument = await documentRepository.getDocumentByIdAndVersion(
				document.id,
				document.version
			);
			const versionList = latestDocument?.versions?.map((v) => v.version);
			if (versionList && versionList.indexOf(document.version) > -1) {
				await documentRepository.updateDocumentAvStatus(document);
			}

			responseDocuments.push({
				id: document.id,
				version: document.version,
				virusCheckStatus: document.virusCheckStatus
			});
		}
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	res.send({ documents: responseDocuments });
};

export {
	addDocuments,
	addDocumentVersion,
	getDocument,
	getDocumentAndVersions,
	getFolder,
	updateDocuments,
	updateDocumentsAvCheckStatus,
	deleteDocumentVersion
};
