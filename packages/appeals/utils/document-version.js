/**
 * Get highest version number from latest version and version history.
 *
 * @param {number|null} [latestVersion]
 * @param {Array<{version: number}>|null} [versions]
 * @returns {number}
 */
export const getMaxDocumentVersion = (latestVersion, versions) =>
	Math.max(latestVersion ?? 0, ...(versions ?? []).map(({ version }) => version));
