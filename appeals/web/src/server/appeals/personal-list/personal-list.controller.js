import usersService from '#appeals/appeal-users/users-service.js';
import config from '#environment/config.js';
import logger from '#lib/logger.js';
import { mapPagination } from '#lib/mappers/index.js';
import { getPaginationParametersFromQuery } from '#lib/pagination-utilities.js';
import { stripQueryString } from '#lib/url-utilities.js';
import { personalListPage } from './personal-list.mapper.js';
import { getAppealsAssignedToCurrentUser } from './personal-list.service.js';
/** @typedef {import('@pins/appeals').Pagination} Pagination */

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewPersonalList = async (request, response) => {
	const { originalUrl, query, session } = request;

	const appealStatusFilter = query.appealStatusFilter && String(query.appealStatusFilter);
	const caseOfficerId = query?.caseOfficerId && String(query?.caseOfficerId);
	const urlWithoutQuery = stripQueryString(originalUrl);
	const paginationParameters = getPaginationParametersFromQuery(query);

	const caseOfficer =
		caseOfficerId && config.featureFlags.featureFlagSearchCaseOfficer
			? (await usersService.getUserById(caseOfficerId, session)) || null
			: null;

	const assignedAppeals = await getAppealsAssignedToCurrentUser(
		request.apiClient,
		appealStatusFilter,
		paginationParameters.pageNumber,
		paginationParameters.pageSize,
		caseOfficer
	).catch((error) => logger.error(error));

	if (!assignedAppeals) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = personalListPage(
		assignedAppeals,
		urlWithoutQuery,
		appealStatusFilter,
		request.session,
		request,
		caseOfficer
	);

	const pagination = mapPagination(
		assignedAppeals.page,
		assignedAppeals.pageCount,
		assignedAppeals.pageSize,
		urlWithoutQuery,
		query
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		pagination,
		pageIsPersonalList: true
	});
};
