import { getAttachmentsFolder } from '#appeals/appeal-details/representations/document-attachments/attachments-service.js';

/**
 * Filter attachments for the current representation
 * @param {*[]} folderDocuments
 * @param {*[]} representationAttachments
 * @returns {*|*[]}
 */
const filterAttachmentsForCurrentRepresentation = (
	folderDocuments = [],
	representationAttachments = []
) => {
	if (!representationAttachments.length || !folderDocuments.length) {
		return;
	}
	// Filter out attachments that are not in the representation
	const attachmentGuids = representationAttachments.map((attachment) =>
		attachment.documentGuid ? attachment.documentGuid : attachment.documentVersion?.document?.guid
	);
	// @ts-ignore
	return folderDocuments.filter((document) => attachmentGuids.includes(document.id));
};

/**
 * @type {import('express').RequestHandler}
 */
export const getRepresentationAttachmentsFolder = async (req, res, next) => {
	const { appealId } = req.params;

	try {
		req.currentFolder = await getAttachmentsFolder(req.apiClient, appealId);
		req.currentFolder.documents = filterAttachmentsForCurrentRepresentation(
			req.currentFolder?.documents,
			req.currentRepresentation?.attachments
		);
	} catch (/** @type {any} */ error) {
		return res.status(500).render('app/500.njk');
	}

	next();
};
