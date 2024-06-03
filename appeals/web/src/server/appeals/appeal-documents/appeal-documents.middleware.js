import { getFolder, getFileInfo } from './appeal.documents.service.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const validateCaseFolderId = async (req, res, next) => {
	const { appealId, folderId } = req.params;
	const folder = await getFolder(req.apiClient, appealId, folderId);

	if (!folder) {
		console.log('validateCaseFolderId 404');
		return res.status(404).render('app/404');
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
			console.log('validateCaseDocumentId 404');
			return res.status(404).render('app/404');
		}
	}

	next();
};
