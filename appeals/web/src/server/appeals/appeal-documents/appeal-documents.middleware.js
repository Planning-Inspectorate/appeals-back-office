import { paginationDefaultSettings } from '#appeals/appeal.constants.js';
import { DOCUMENTS_PAGE_SIZE } from '@pins/appeals/constants/common.js';
import { getFileInfo, getFolder } from './appeal.documents.service.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const validateCaseFolderId = async (req, res, next) => {
	const { appealId, folderId } = req.params;
	const { pageNumber = paginationDefaultSettings.firstPageNumber } = req.query;
	if (Number.isNaN(Number(pageNumber)) || Number(pageNumber) < 1) {
		return res.status(400).render('app/400.njk');
	}
	const repId = req.currentRepresentation?.id;
	const folder = await getFolder(
		req.apiClient,
		appealId,
		folderId,
		Number(pageNumber),
		DOCUMENTS_PAGE_SIZE,
		repId
	);

	if (!folder) {
		return res.status(404).render('app/404.njk');
	}

	req.currentFolder = folder;
	req.currentPageNumber = Number(pageNumber);
	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const validateCaseDocumentId = async (req, res, next) => {
	const { documentId } = req.params;
	if (documentId) {
		const document = await getFileInfo(req.apiClient, documentId);
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
