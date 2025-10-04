import featureFlags from '#common/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { paginationDefaultSettings } from '../appeal.constants.js';

/** @typedef {import('@pins/appeals').AppealList} AppealList */

/**
 * @param {import('got').Got} apiClient
 * @param {string|undefined} appealStatusFilter
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise<AppealList>}
 */
export const getAppealsAssignedToCurrentUser = (
	apiClient,
	appealStatusFilter,
	pageNumber = paginationDefaultSettings.firstPageNumber,
	pageSize = paginationDefaultSettings.pageSize
) => {
	let urlAppendix = '';

	if (appealStatusFilter && appealStatusFilter !== 'all') {
		urlAppendix = `&status=${appealStatusFilter}`;
	}

	const pageName = featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.PERSONAL_LIST)
		? 'personal-list'
		: 'my-appeals';

	return apiClient
		.get(`appeals/${pageName}?pageNumber=${pageNumber}&pageSize=${pageSize}${urlAppendix}`)
		.json();
};
