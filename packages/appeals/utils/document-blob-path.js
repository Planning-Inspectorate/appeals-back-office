/**
 * @param {string} guid
 * @param {string} caseReference
 * @param {string} name
 * @param {number} [versionId]
 * @returns {string}
 */
export const mapBlobPath = (guid, caseReference, name, versionId = 1) =>
	`appeal/${caseReference}/${guid}/v${versionId}/${name}`;
