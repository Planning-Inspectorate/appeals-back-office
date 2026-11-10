import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
import {
	FOLDER_SELECTOR_ERROR,
	isValidFolderSelector
} from '@pins/appeals/utils/folder-selector.js';
import {
	REPRESENTATION_SELECTOR_ERROR,
	isValidRepresentationTypes
} from '@pins/appeals/utils/representation-selector.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} [include]
 * @param {import('@pins/appeals/utils/folder-selector.js').FolderSelector} [folderSelector]
 * @param {string[]} [representationTypes]
 * @returns {Promise<import('./appeal-details.types.js').WebAppeal>}
 */
export function getAppealDetailsFromId(
	apiClient,
	appealId,
	include,
	folderSelector,
	representationTypes
) {
	if (include === 'all') {
		throw new Error('include=all is not allowed, select only the keys needed');
	}
	if (include?.split(',').includes('folders') && !isValidFolderSelector(folderSelector)) {
		throw new Error(FOLDER_SELECTOR_ERROR);
	}
	if (
		include?.split(',').includes('representations') &&
		!isValidRepresentationTypes(representationTypes)
	) {
		throw new Error(REPRESENTATION_SELECTOR_ERROR);
	}

	const ids = assertValidNumericIds({ appealId });
	const encodedAppealId = encodeURIComponent(ids.appealId);
	let url = include
		? `appeals/${encodedAppealId}?include=${include}`
		: `appeals/${encodedAppealId}`;

	if (folderSelector || representationTypes) {
		const searchParams = new URLSearchParams();
		if (folderSelector?.stage) {
			searchParams.set('folderStage', folderSelector.stage);
		}
		if (folderSelector?.paths) {
			searchParams.set('folderPaths', folderSelector.paths.join(','));
		}
		if (representationTypes) {
			searchParams.set('representationTypes', representationTypes.join(','));
		}
		url += `${include ? '&' : '?'}${searchParams}`;
	}

	return apiClient.get(url).json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<import('./appeal-details.types.js').WebAppeal>}
 */
export function getAppealDetailsPageFromId(apiClient, appealId) {
	const encodedAppealId = encodeURIComponent(appealId);
	const url = `appeals/${encodedAppealId}/page-details`;

	return apiClient.get(url).json();
}

/**
 * @deprecated Inefficient use getAppealDetailsFromId and select only the data needed
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<import('./appeal-details.types.js').WebAppeal>}
 */
export function deprecatedGetAppealDetailsFromId(apiClient, appealId) {
	const ids = assertValidNumericIds({ appealId });
	const encodedAppealId = encodeURIComponent(ids.appealId);
	const url = `appeals/${encodedAppealId}?include=all`;

	return apiClient.get(url).json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<{id: number, appealId: number, appealReference: string}>}
 */
export function checkAppealExists(apiClient, appealId) {
	const ids = assertValidNumericIds({ appealId });
	const encodedAppealId = encodeURIComponent(ids.appealId);
	const url = `appeals/${encodedAppealId}/exists`;

	return apiClient.get(url).json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {boolean} eiaScreeningRequired
 * @returns {Promise<import('./appeal-details.types.js').WebAppeal>}
 */
export function setEnvironmentalImpactAssessmentScreening(
	apiClient,
	appealId,
	eiaScreeningRequired
) {
	const ids = assertValidNumericIds({ appealId });
	const encodedAppealId = encodeURIComponent(ids.appealId);
	return apiClient
		.patch(`appeals/${encodedAppealId}/eia-screening-required`, {
			json: { eiaScreeningRequired }
		})
		.json();
}
