import logger from '#lib/logger.js';
import config from '#environment/config.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { nationalListPage } from './national-list.mapper.js';
import { getAppeals, getAppealTypes } from './national-list.service.js';
import { getPaginationParametersFromQuery } from '#lib/pagination-utilities.js';
import { mapPagination } from '#lib/mappers/index.js';
import { stripQueryString } from '#lib/url-utilities.js';

/** @typedef {import('@pins/appeals').Pagination} Pagination */

//This is a test functions to check user permissions on AD
export const getCaseOfficers = async (
	/** @type {{ session: import("../../app/auth/auth-session.service.js").SessionWithAuth; }} */
	request,
	/** @type {{ json: (arg0: { id: string; name: string; email: string; }[]) => void; }} */
	response
) => {
	const caseOfficers = await usersService.getUsersByRole(
		config.referenceData.appeals.caseOfficerGroupId,
		request.session
	);
	response.json(caseOfficers);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewNationalList = async (request, response) => {
	const { originalUrl, query, session } = request;

	const appealStatusFilter = query.appealStatusFilter && String(query.appealStatusFilter);
	const inspectorStatusFilter = query.inspectorStatusFilter && String(query.inspectorStatusFilter);
	const localPlanningAuthorityFilter =
		query.localPlanningAuthorityFilter && String(query.localPlanningAuthorityFilter);
	const caseOfficerFilter = query.caseOfficerFilter && String(query.caseOfficerFilter);
	const inspectorFilter = query.inspectorFilter && String(query.inspectorFilter);
	const greenBeltFilter = query.greenBeltFilter && String(query.greenBeltFilter);
	const appealTypeFilter = query.appealTypeFilter && String(query.appealTypeFilter);
	let searchTerm = query?.searchTerm ? String(query.searchTerm).trim() : '';
	let searchTermError = '';

	if (searchTerm && searchTerm.length && (searchTerm.length === 1 || searchTerm.length > 50)) {
		searchTerm = '';
		searchTermError =
			'Appeal reference, planning application reference or postcode must be between 2 and 50 characters';
	}

	const appealTypes = await getAppealTypes(request.apiClient);

	const urlWithoutQuery = stripQueryString(originalUrl);
	const paginationParameters = getPaginationParametersFromQuery(query);
	const appeals = await getAppeals(
		request.apiClient,
		searchTerm,
		appealStatusFilter,
		inspectorStatusFilter,
		localPlanningAuthorityFilter,
		caseOfficerFilter,
		inspectorFilter,
		greenBeltFilter,
		appealTypeFilter,
		paginationParameters.pageNumber,
		paginationParameters.pageSize
	).catch((error) => logger.error(error));

	if (!appeals) {
		return response.status(404).render('app/404.njk');
	}

	const users = await Promise.all(
		[...appeals.caseOfficers, ...appeals.inspectors].map(async ({ id, azureAdUserId }) => {
			const user = await usersService.getUserById(azureAdUserId, session);
			return {
				id,
				azureAdUserId,
				name: user ? user.name : `User not found (${id})`
			};
		})
	);

	const mappedPageContent = nationalListPage(
		users,
		appeals,
		appealTypes,
		urlWithoutQuery,
		searchTerm,
		searchTermError,
		appealStatusFilter,
		inspectorStatusFilter,
		localPlanningAuthorityFilter,
		caseOfficerFilter,
		inspectorFilter,
		appealTypeFilter,
		greenBeltFilter
	);

	const pagination = mapPagination(
		appeals.page,
		appeals.pageCount,
		appeals.pageSize,
		urlWithoutQuery,
		query
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		pagination,
		pageIsNationalList: true
	});
};
