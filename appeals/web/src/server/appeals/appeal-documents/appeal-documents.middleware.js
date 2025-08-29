import { getFileInfo, getFolder } from './appeal.documents.service.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const validateCaseFolderId = async (req, res, next) => {
	const { appealId, folderId } = req.params;
	const repId = req.currentRepresentation?.id;
	const folder = await getFolder(req.apiClient, appealId, folderId, repId);

	if (!folder) {
		return res.status(404).render('app/404.njk');
	}

	req.currentFolder = folder;
	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const validateCaseDocumentId = async (req, res, next) => {
	const { appealId, documentId } = req.params;
	if (documentId) {
		const document = await getFileInfo(req.apiClient, appealId, documentId);
		if (!document || !document.latestDocumentVersion) {
			return res.status(404).render('app/404.njk');
		}
	}

	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {void}
 */
export const clearUncommittedFilesFromSession = (req, res, next) => {
	if (req.session.fileUploadInfo) {
		delete req.session.fileUploadInfo;
		delete req.session.inspectorDecision;
	}
	next();
};
