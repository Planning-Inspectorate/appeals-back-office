import { getAttachmentsFolder } from '#appeals/appeal-details/representations/document-attachments/attachments-service.js';

/**
 * @type {import('express').RequestHandler}
 */
export const getRepresentationAttachmentsFolder = async (req, res, next) => {
	const { appealId } = req.params;

	try {
		req.currentFolder = await getAttachmentsFolder(req.apiClient, appealId);
		if (req.currentFolder.documents?.length && req.currentRepresentation?.attachments?.length) {
			// Filter out attachments that are not in the representation
			const attachmentGuids = req.currentRepresentation.attachments.map((attachment) =>
				attachment.documentGuid
					? attachment.documentGuid
					: attachment.documentVersion?.document?.guid
			);
			// @ts-ignore
			req.currentFolder.documents = req.currentFolder.documents.filter((document) =>
				attachmentGuids.includes(document.id)
			);
		}
	} catch (/** @type {any} */ error) {
		return res.status(500).render('app/500.njk');
	}

	next();
};
