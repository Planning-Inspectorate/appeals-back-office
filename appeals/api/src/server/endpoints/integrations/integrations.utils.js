import Path from 'node:path';

/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand['documents'][number]} AppellantSubmissionDocument */
/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand['documents'][number]} LPAQuestionnaireCommandDocument */

/**
 *
 * @param {(AppellantSubmissionDocument|LPAQuestionnaireCommandDocument)[]} documents
 * @returns {(AppellantSubmissionDocument|LPAQuestionnaireCommandDocument)[]}
 */
export const renameDuplicateDocuments = (documents) => {
	const seen = new Set();

	return documents.map((document) => {
		let key = `${document.documentType}_${document.originalFilename}`;

		if (!seen.has(key)) {
			seen.add(key);
			return document;
		}

		const parsedDocName = Path.parse(document.originalFilename);
		const extension = parsedDocName.ext;
		const originalName = parsedDocName.name;

		let counter = 1;
		let newFilename;

		do {
			newFilename = `${originalName}_${counter}${extension}`;
			key = `${document.documentType}_${newFilename}`;
			counter++;

			if (counter > 1000) {
				throw new Error('Error processing document names on import, too many iterations...');
			}
		} while (seen.has(key));

		seen.add(key);
		return {
			...document,
			originalFilename: newFilename
		};
	});
};
