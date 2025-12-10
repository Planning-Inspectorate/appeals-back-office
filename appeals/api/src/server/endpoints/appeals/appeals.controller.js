import { addAwaitingLinkedAppealToPersonalList } from '#endpoints/appeals/appeals.utils.js';
import personalListRepository from '#repositories/personal-list.repository.js';
import { getPageCount } from '#utils/database-pagination.js';
import {
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	ERROR_CANNOT_BE_EMPTY_STRING
} from '@pins/appeals/constants/support.js';
import { formatPersonalListItem } from './appeals.formatter.js';
import { retrieveAppealListData, updateCompletedEvents } from './appeals.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppealDetailsResponse} SingleAppealDetailsResponse */
/** @typedef {import('@pins/appeals').CostsDecision} CostsDecision */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppeals = async (req, res) => {
	const { query } = req;
	let { searchTerm, status, hasInspector, lpaCode, inspectorId, caseOfficerId, padsInspectorId } =
		query;
	const pageNumber = Number(query.pageNumber) || DEFAULT_PAGE_NUMBER;
	const pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
	const isGreenBelt = query.isGreenBelt === 'true';
	const appealTypeId = Number(query.appealTypeId) || null;
	const assignedTeamId = Number(query.assignedTeamId) || null;
	const procedureTypeId = Number(query.procedureTypeId) || null;
	const appellantProcedurePreference = query.appellantProcedurePreference || null;

	let lpaCodes = null;
	if (lpaCode) {
		lpaCodes =
			typeof lpaCode === 'string' ? lpaCode.split(',').map((code) => code.trim()) : lpaCode;
	}
	let excludedLpaCodes = null;
	if (query.excludeLpaCode) {
		excludedLpaCodes =
			typeof query.excludeLpaCode === 'string'
				? query.excludeLpaCode.split(',').map((code) => code.trim())
				: query.excludeLpaCode;
	}

	const {
		itemCount,
		mappedAppeals,
		mappedStatuses,
		statusesInNationalList,
		mappedLPAs,
		mappedInspectors,
		mappedCaseOfficers,
		mappedPadsInspectors
	} = await retrieveAppealListData(
		pageNumber,
		pageSize,
		// @ts-ignore
		searchTerm,
		status,
		hasInspector,
		lpaCodes,
		excludedLpaCodes,
		inspectorId,
		caseOfficerId,
		padsInspectorId,
		isGreenBelt,
		appealTypeId,
		assignedTeamId,
		procedureTypeId,
		appellantProcedurePreference
	);

	return res.send({
		itemCount,
		items: mappedAppeals,
		statuses: mappedStatuses,
		statusesInNationalList,
		lpas: mappedLPAs,
		inspectors: mappedInspectors,
		caseOfficers: mappedCaseOfficers,
		padsInspectors: mappedPadsInspectors,
		page: pageNumber,
		pageCount: getPageCount(itemCount, pageSize),
		pageSize
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getPersonalList = async (req, res) => {
	const { query } = req;
	const pageNumber = Number(query.pageNumber) || DEFAULT_PAGE_NUMBER;
	const pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
	const status = query.status ? String(query.status) : undefined;
	const caseOfficerId = query.caseOfficerId ? query?.caseOfficerId.toString() : '';
	const azureUserId = caseOfficerId || req.get('azureAdUserId');

	if (!azureUserId) {
		return res.status(401).send({ errors: { azureUserId: ERROR_CANNOT_BE_EMPTY_STRING } });
	}

	let {
		personalList = [],
		itemCount = 0,
		statuses = []
	} = await personalListRepository.getPersonalList(azureUserId, pageNumber, pageSize, status);

	if (personalList.length > 0) {
		personalList = await addAwaitingLinkedAppealToPersonalList(
			personalList,
			azureUserId,
			pageSize,
			status
		);
	}

	// @ts-ignore
	const items = await Promise.all(personalList.map(formatPersonalListItem));

	return res.send({
		itemCount,
		items,
		statuses: statuses,
		page: pageNumber,
		pageCount: getPageCount(itemCount, pageSize),
		pageSize
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
async function updateCompletedEventsController(req, res) {
	const azureAdUserId = req.params.azureAdUserId || req.get('azureAdUserId') || '';

	await updateCompletedEvents(azureAdUserId);

	return res.status(204).end();
}

export { getAppeals, getPersonalList, updateCompletedEventsController };
