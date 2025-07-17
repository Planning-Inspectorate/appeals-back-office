import Path from 'node:path';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { APPEAL_CASE_STAGE } from '@planning-inspectorate/data-model';

/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppellantSubmissionCommand['documents'][number]} AppellantSubmissionDocument */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand['documents'][number]} LPAQuestionnaireCommandDocument */

/**
 *
 * @param {{ path: string, id: number }[]} caseFolders
 * @param {string} documentType
 * @param {string|null} stage
 * @returns {number}
 */
export const getFolderIdFromDocumentType = (caseFolders, documentType, stage) => {
	if (stage) {
		const matchedFolder = caseFolders.find(
			(caseFolder) => caseFolder.path === `${stage}/${documentType}`
		);

		if (matchedFolder) {
			return matchedFolder.id;
		}
	}

	const caseFolder = caseFolders.find(
		(caseFolder) => caseFolder.path.indexOf(`/${documentType}`) > 0
	);

	if (caseFolder) {
		return caseFolder.id;
	}

	return (
		caseFolders.find(
			(caseFolder) =>
				caseFolder.path === `${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.UNCATEGORISED}`
		)?.id ?? 0
	);
};

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
