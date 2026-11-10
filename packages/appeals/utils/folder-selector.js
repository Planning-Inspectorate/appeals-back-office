import { FOLDERS } from '../constants/documents.js';

/**
 * @typedef {{ stage?: string, paths?: string[] }} FolderSelector
 */

export const FOLDER_SELECTOR_ERROR =
	'Including folders requires a folder selector with a non-empty stage or path selector';

/**
 * @param {unknown} selectorPart
 * @returns {selectorPart is string}
 */
function isValidFolderSelectorPart(selectorPart) {
	return (
		typeof selectorPart === 'string' &&
		selectorPart.trim().length > 0 &&
		FOLDERS.some((path) => path.startsWith(selectorPart))
	);
}

/**
 * @param {unknown} selector
 * @returns {selector is FolderSelector}
 */
export function isValidFolderSelector(selector) {
	if (!selector || typeof selector !== 'object') {
		return false;
	}

	const stage = 'stage' in selector ? selector.stage : undefined;
	const paths = 'paths' in selector ? selector.paths : undefined;
	const validStage = isValidFolderSelectorPart(stage);
	const validPaths =
		Array.isArray(paths) && paths.length > 0 && paths.every(isValidFolderSelectorPart);

	// must have a filter
	return (
		(stage === undefined || validStage) &&
		(paths === undefined || validPaths) &&
		(validStage || validPaths)
	);
}
