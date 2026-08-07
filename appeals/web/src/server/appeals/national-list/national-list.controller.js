import usersService from '#appeals/appeal-users/users-service.js';
import { toNationalListViewModel } from '#appeals/national-list/national-list.view-model.ts';
import config from '#environment/config.js';
import { dbClient } from '#lib/database-client.js';
import { mapPagination } from '#lib/mappers/index.js';
import { getPaginationParametersFromQuery } from '#lib/pagination-utilities.js';
import { stripQueryString } from '#lib/url-utilities.js';
import { getAppellantProcedurePreference, nationalListPage } from './national-list.mapper.js';
import { NationalListService } from './national-list.service.ts';

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
	const { originalUrl, query, session, params } = request;
	delete session.changeAppealType;

	const appealStatusFilter = query.appealStatusFilter && String(query.appealStatusFilter);
	const inspectorStatusFilter = query.inspectorStatusFilter && String(query.inspectorStatusFilter);
	const localPlanningAuthorityFilter =
		query.localPlanningAuthorityFilter && String(query.localPlanningAuthorityFilter);
	const caseOfficerFilter = query.caseOfficerFilter && String(query.caseOfficerFilter);
	const inspectorFilter = query.inspectorFilter && String(query.inspectorFilter);
	const greenBeltFilter = query.greenBeltFilter && String(query.greenBeltFilter);
	const appealTypeFilter = query.appealTypeFilter && String(query.appealTypeFilter);
	const caseTeamFilter = query.caseTeamFilter && String(query.caseTeamFilter);
	const appealProcedureFilter = query.appealProcedureFilter && String(query.appealProcedureFilter);
	let searchTerm = query?.searchTerm ? String(query.searchTerm).trim() : '';
	let searchTermError = '';
	const procedurePreferenceRequest =
		params.procedurePreferenceRequest && String(params.procedurePreferenceRequest);
	const appellantProcedurePreferencePreFilter = getAppellantProcedurePreference(
		procedurePreferenceRequest
	);

	if (searchTerm && searchTerm.length && (searchTerm.length === 1 || searchTerm.length > 50)) {
		searchTerm = '';
		searchTermError =
			'Appeal reference, planning application or enforcement reference, or postcode must be between 2 and 50 characters';
	}

	const urlWithoutQuery = stripQueryString(originalUrl);
	const paginationParameters = getPaginationParametersFromQuery(query);

	const service = new NationalListService(dbClient);

	const [appealTypes, appealProcedureTypes, caseTeams, appealsStatusesInNationalList, results] =
		await Promise.all([
			service.getAppealTypes(),
			service.getAppealProcedureTypes(),
			service.getCaseTeams(),
			service.getAppealsStatusesInNationalList(),
			service.getAppeals({
				searchTerm,
				appealStatusFilter,
				inspectorStatusFilter,
				localPlanningAuthorityFilter,
				caseOfficerFilter,
				inspectorFilter,
				greenBeltFilter,
				appealTypeFilter,
				caseTeamFilter,
				appealProcedureFilter,
				appellantProcedurePreferencePreFilter,
				pageNumber: paginationParameters.pageNumber,
				pageSize: paginationParameters.pageSize
			})
		]);

	// I don't think this can ever be hit?
	if (!results) {
		return response.status(404).render('app/404.njk');
	}

	const viewModel = toNationalListViewModel(
		results,
		paginationParameters,
		appealsStatusesInNationalList
	);

	const users = await Promise.all(
		[...viewModel.caseOfficers, ...viewModel.inspectors].map(async ({ id, azureAdUserId }) => {
			const user = azureAdUserId && (await usersService.getUserById(azureAdUserId, session));
			return {
				id,
				azureAdUserId,
				name: user ? user.name : `User not found (${id})`
			};
		})
	);
	const mappedPageContent = nationalListPage(
		users,
		viewModel,
		appealTypes,
		caseTeams,
		appealProcedureTypes,
		urlWithoutQuery,
		searchTerm,
		searchTermError,
		appealStatusFilter,
		inspectorStatusFilter,
		localPlanningAuthorityFilter,
		caseOfficerFilter,
		inspectorFilter,
		appealTypeFilter,
		caseTeamFilter,
		appealProcedureFilter,
		greenBeltFilter,
		viewModel.padsInspectors
	);

	const pagination = mapPagination(
		viewModel.page,
		viewModel.pageCount,
		viewModel.pageSize,
		urlWithoutQuery,
		query
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		pagination,
		pageIsNationalList: true
	});
};
