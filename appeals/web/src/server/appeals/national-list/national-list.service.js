import { paginationDefaultSettings } from '../appeal.constants.js';

/** @typedef {import('@pins/appeals').AppealList} AppealList */

/**
 * @param {import('got').Got} apiClient
 * @param {string|undefined} searchTerm
 * @param {string|undefined} appealStatusFilter
 * @param {string|undefined} inspectorStatusFilter
 * @param {string|undefined} localPlanningAuthorityFilter
 * @param {string|undefined} caseOfficerFilter
 * @param {string|undefined} inspectorFilter
 * @param {string|undefined} greenBeltFilter
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise<AppealList>}
 */
export const getAppeals = (
	apiClient,
	searchTerm,
	appealStatusFilter,
	inspectorStatusFilter,
	localPlanningAuthorityFilter,
	caseOfficerFilter,
	inspectorFilter,
	greenBeltFilter,
	pageNumber = paginationDefaultSettings.firstPageNumber,
	pageSize = paginationDefaultSettings.pageSize
) => {
	let urlAppendix = '';

	if (searchTerm && searchTerm !== '') {
		urlAppendix += `&searchTerm=${encodeURIComponent(searchTerm)}`;
	}

	if (appealStatusFilter && appealStatusFilter !== 'all') {
		urlAppendix += `&status=${appealStatusFilter}`;
	}

	if (inspectorStatusFilter && inspectorStatusFilter !== 'all') {
		if (inspectorStatusFilter === 'assigned') {
			urlAppendix += `&hasInspector=true`;
		} else if (inspectorStatusFilter === 'unassigned') {
			urlAppendix += `&hasInspector=false`;
		}
	}

	return apiClient
		.get(`appeals?pageNumber=${pageNumber}&pageSize=${pageSize}${urlAppendix}`)
		.json();
};
