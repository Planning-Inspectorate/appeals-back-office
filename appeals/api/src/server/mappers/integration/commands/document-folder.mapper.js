import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';

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
