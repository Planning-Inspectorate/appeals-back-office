import { paginationDefaultSettings } from '../appeal.constants.js';

/** @typedef {import('@pins/appeals').AppealList} AppealList */

/**
 * @param {import('got').Got} apiClient
 * @param {string|undefined} appealStatusFilter
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {import('#appeals/appeal-users/users-service.js').User|null} caseOfficer
 * @returns {Promise<AppealList>}
 */
export const getAppealsAssignedToCurrentUser = (
	apiClient,
	appealStatusFilter,
	pageNumber = paginationDefaultSettings.firstPageNumber,
	pageSize = paginationDefaultSettings.pageSize,
	caseOfficer
) => {
	let urlAppendix = '';

	if (appealStatusFilter && appealStatusFilter !== 'all') {
		urlAppendix = `&status=${appealStatusFilter}`;
	}

	if (caseOfficer) {
		urlAppendix += `&caseOfficerId=${caseOfficer.id}`;
	}
	return apiClient
		.get(`appeals/personal-list?pageNumber=${pageNumber}&pageSize=${pageSize}${urlAppendix}`)
		.json();
};
