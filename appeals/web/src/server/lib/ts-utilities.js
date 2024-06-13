/**
 * @param {T|undefined} value
 * @return {value is T}
 * @template T
 */
export function isDefined(value) {
	return value !== undefined;
}

/** @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo */
/**
 * @typedef {Object} FileUploadInfoItem
 * @property {string} name
 * @property {string} GUID
 * @property {string} fileRowId
 * @property {string} blobStoreUrl
 * @property {string} mimeType
 * @property {string} documentType
 * @property {number} size
 * @property {string} stage
 * @property {string} receivedDate
 * @property {number} redactionStatus
 */

/**
 * @param {FolderInfo|any|null|undefined} value
 * @return {value is FolderInfo}
 */
export function isFolderInfo(value) {
	if (!value || value === null) {
		return false;
	}
	return (
		value !== null &&
		value !== undefined &&
		typeof value === 'object' &&
		'folderId' in value &&
		'path' in value &&
		'documents' in value
	);
}

/**
 * @param {FileUploadInfoItem[]|any} value
 * @return {value is FileUploadInfoItem[]}
 */
export function isFileUploadInfo(value) {
	if (!Array.isArray(value)) {
		return false;
	}

	for (const item of value) {
		if (!isFileUploadInfoItem(item)) {
			return false;
		}
	}

	return true;
}

/**
 * @param {FileUploadInfoItem|any} value
 * @return {value is FileUploadInfoItem}
 */
export function isFileUploadInfoItem(value) {
	return (
		value !== null &&
		value !== undefined &&
		typeof value === 'object' &&
		'name' in value &&
		'GUID' in value &&
		'fileRowId' in value &&
		'blobStoreUrl' in value &&
		'mimeType' in value &&
		'documentType' in value &&
		'size' in value &&
		'stage' in value
	);
}
