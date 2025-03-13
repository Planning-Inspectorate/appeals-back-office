import { getDocumentById } from '#repositories/document.repository.js';
import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const checkDocumentExistsAndAddToRequest = async (req, res, next) => {
	const { documentGuid } = req.body;
	const document = await getDocumentById(documentGuid);

	if (!document || document.isDeleted) {
		return res.status(404).send({ errors: { documentId: ERROR_NOT_FOUND } });
	}

	req.document = document;
	next();
};
