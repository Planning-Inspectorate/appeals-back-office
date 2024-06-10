/**
 * @param {import('@pins/appeals.api').Appeals.FolderInfo} folder
 * @returns {boolean}
 */
export function folderIsAdditionalDocuments(folder) {
	const folderPathFragments = folder.path.split('/');
	return (
		folderPathFragments[1] === 'additionalDocuments' ||
		folderPathFragments[1] === 'appellantCaseCorrespondence'
	);
}
