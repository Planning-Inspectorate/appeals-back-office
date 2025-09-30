import {
	AUDIT_TRAIL_DECISION_LETTER_UPDATED,
	AUDIT_TRAIL_DECISION_LETTER_UPLOADED,
	AUDIT_TRAIL_DOCUMENT_DATE_CHANGED,
	AUDIT_TRAIL_DOCUMENT_DELETED,
	AUDIT_TRAIL_DOCUMENT_NAME_CHANGED,
	AUDIT_TRAIL_DOCUMENT_NO_REDACTION_REQUIRED,
	AUDIT_TRAIL_DOCUMENT_REDACTED,
	AUDIT_TRAIL_DOCUMENT_UNREDACTED,
	AUDIT_TRAIL_DOCUMENT_UPLOADED,
	ERROR_DOCUMENT_NAME_ALREADY_EXISTS,
	ERROR_FAILED_TO_ADD_DOCUMENTS,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';

import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { sendNewDecisionLetter } from '#endpoints/decision/decision.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import * as documentRepository from '#repositories/document.repository.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { updatePersonalList } from '#utils/update-personal-list.js';
import { EventType } from '@pins/event-client';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { formatDocument } from './documents.formatter.js';
import * as service from './documents.service.js';

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
	const repId = Number(req.query.repId) || null;
	const folder = await service.getFolderForAppeal(appeal.id, folderId, repId);

	return res.send(folder);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 * */
const getFolders = async (req, res) => {
	const { appeal } = req;
	const { path } = req.query;

	if (path) {
		const folders = await service.getFolderByPath(appeal.id, /** @type {string} */ (path));
		return res.send(folders);
	}

	const folders = await service.getFoldersForAppeal(appeal.id);
	return res.send(folders);
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
	const { appeal } = req;

	try {
		const documentInfo = await service.addDocumentsToAppeal(req.body, appeal);

		await updatePersonalList(appeal.id);

		const auditTrails = await Promise.all(
			documentInfo.documents.filter(Boolean).map(async (document) => {
				let auditTrail;
				if (document.documentType === APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER) {
					const decisionLetterHtmlLink = buildDecisionDocumentLinkHtml(
						appeal.id,
						document.GUID,
						document.documentName,
						document.documentName,
						1
					);
					auditTrail = await createAuditTrail({
						appealId: appeal.id,
						azureAdUserId: req.get('azureAdUserId'),
						details: stringTokenReplacement(AUDIT_TRAIL_DECISION_LETTER_UPLOADED, [
							decisionLetterHtmlLink
						])
					});
				} else {
					auditTrail = await createAuditTrail({
						appealId: appeal.id,
						azureAdUserId: req.get('azureAdUserId'),
						details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_UPLOADED, [
							document.documentName,
							1,
							document.redactionStatus
						])
					});
				}

				return {
					guid: document.GUID,
					version: 1,
					audit: auditTrail
				};
			})
		);

		for (const auditTrail of auditTrails) {
			if (!auditTrail?.guid || !auditTrail?.version || !auditTrail?.audit) {
				continue;
			}

			service.addDocumentAudit(auditTrail.guid, 1, auditTrail.audit, 'Create');
		}

		return res.status(204).send();
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

	if (!updatedDocument) {
		return res.sendStatus(404);
	}
	(async () => {
		let auditTrail;
		if (updatedDocument.documentType === APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER) {
			const decisionLetterHtmlLink = buildDecisionDocumentLinkHtml(
				appeal.id,
				document.guid,
				body.document.documentName,
				updatedDocument.documentName,
				updatedDocument.versionId
			);
			auditTrail = await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId: req.get('azureAdUserId'),
				details: stringTokenReplacement(AUDIT_TRAIL_DECISION_LETTER_UPDATED, [
					decisionLetterHtmlLink
				])
			});
			if (body.correctionNotice) {
				sendNewDecisionLetter(
					appeal,
					body.correctionNotice,
					req.get('azureAdUserId') || '',
					req.notifyClient,
					req.body.document.receivedDate
				);
			}
		} else {
			auditTrail = await createAuditTrail({
				appealId: appeal.id,
				azureAdUserId: req.get('azureAdUserId'),
				details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_UPLOADED, [
					updatedDocument.documentName,
					updatedDocument.versionId,
					updatedDocument.redactionStatus
				])
			});
		}

		if (auditTrail) {
			service.addDocumentAudit(document.guid, updatedDocument.versionId, auditTrail, 'Create');
		}
	})();

	return res.status(201).send(getStorageInfo(documentInfo.documents));
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
	if (!documentInfo) {
		return res.sendStatus(404);
	}

	(async () => {
		const auditTrail = await createAuditTrail({
			appealId: document.caseId,
			azureAdUserId: req.get('azureAdUserId'),
			details: stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_DELETED, [document.name, version])
		});

		if (auditTrail) {
			service.addDocumentAudit(document.guid, Number(version), auditTrail, 'Delete');
		}
	})();

	return res.send(documentInfo);
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
					await logAuditTrail(
						latestDocument.name,
						document.latestVersion,
						AUDIT_TRAIL_DOCUMENT_DATE_CHANGED,
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
				receivedDate: document.receivedDate,
				fileName: document.fileName
			});
		}
		await documentRepository.updateDocuments(documents);
		for (const document of documents) {
			await broadcasters.broadcastDocument(document.id, document.latestVersion, EventType.Update);
		}
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	res.send({ documents: responseDocuments });
};

/**
 * @param {Request} req
 * @param {Response} res
 */
const updateDocumentFileName = async (req, res) => {
	const { body, appeal, params } = req;
	const { document } = body;
	const { documentId } = params;

	try {
		const latestDocument = await documentRepository.getDocumentById(documentId);

		if (latestDocument && latestDocument.name && latestDocument.latestDocumentVersion) {
			await documentRepository.updateDocumentById(latestDocument.guid, document);
			if (document.fileName && document.fileName !== latestDocument.name) {
				const nameChangedMessage = stringTokenReplacement(AUDIT_TRAIL_DOCUMENT_NAME_CHANGED, [
					latestDocument.name,
					document.fileName
				]);

				await logAuditTrail(
					latestDocument.name,
					latestDocument.latestDocumentVersion.version,
					nameChangedMessage,
					req,
					appeal.id,
					latestDocument.guid
				);

				await broadcasters.broadcastDocument(
					latestDocument.guid,
					latestDocument.latestDocumentVersion.version,
					EventType.Update
				);
			}
		}
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	res.send({ document });
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
				await broadcasters.broadcastDocument(document.id, document.version, EventType.Update);
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
	deleteDocumentVersion,
	getDocument,
	getDocumentAndVersions,
	getFolder,
	getFolders,
	updateDocumentFileName,
	updateDocuments,
	updateDocumentsAvCheckStatus
};

/**
 * @param {number} appealId
 * @param {string} documentId
 * @param {string} documentName
 * @param {string} linkText
 * @param {number} [documentVersion]
 * @returns {string}
 */
export const buildDecisionDocumentLinkHtml = (
	appealId,
	documentId,
	documentName,
	linkText,
	documentVersion
) => {
	return `<a class="govuk-link" href="${
		documentId && documentName
			? mapDocumentDownloadUrl(appealId, documentId, documentName, documentVersion)
			: '#'
	}" target="_blank">${linkText}</a>`;
};

/**
 * @param {string|number} appealId
 * @param {string} documentId
 * @param {string} filename
 * @param {number} [documentVersion]
 */
export const mapDocumentDownloadUrl = (appealId, documentId, filename, documentVersion) => {
	if (documentVersion) {
		return `/documents/${appealId}/download/${documentId}/${documentVersion}/${filename}`;
	}
	return `/documents/${appealId}/download/${documentId}/${filename}`;
};
