/**
 * @param {import("#appeals/appeal-documents/appeal-documents.mapper.js").RedactionStatus[]} redactionStatuses
 * @param {string} name
 * @returns {number|undefined}
 */
export function redactionStatusNameToId(redactionStatuses, name) {
	return Number(
		redactionStatuses.find(
			(redactionStatus) => redactionStatus.name.toLowerCase() === name.toLowerCase()
		)?.id
	);
}

/**
 * @param {import("#appeals/appeal-documents/appeal-documents.mapper.js").RedactionStatus[]} redactionStatuses
 * @param {number} id
 * @returns {string|undefined}
 */
export function redactionStatusIdToName(redactionStatuses, id) {
	return redactionStatuses
		.find((redactionStatus) => redactionStatus.id === id)
		?.name?.toLowerCase();
}

/**
 * @param {import("#appeals/appeal-documents/appeal-documents.mapper.js").RedactionStatus[]} redactionStatuses
 * @param {string} key
 * @returns {number|undefined}
 */
export function redactionStatusKeyToId(redactionStatuses, key) {
	return Number(redactionStatuses.find((redactionStatus) => redactionStatus.key === key)?.id);
}

/**
 * @param {import("#appeals/appeal-documents/appeal-documents.mapper.js").RedactionStatus[]} redactionStatuses
 * @param {number} id
 * @returns {string|undefined}
 */
export function redactionStatusIdToKey(redactionStatuses, id) {
	return redactionStatuses.find((redactionStatus) => redactionStatus.id === id)?.key;
}
