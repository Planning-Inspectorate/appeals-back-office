import { getPageCount } from '#utils/database-pagination.js';
import { sortAppeals } from '#utils/appeal-sorter.js';
import appealRepository from '#repositories/appeal.repository.js';
import appealListRepository from '#repositories/appeal-lists.repository.js';
import representationRepository from '#repositories/representation.repository.js';
import {
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	ERROR_CANNOT_BE_EMPTY_STRING
} from '../constants.js';
import { formatMyAppeals } from './appeals.formatter.js';
import { retrieveAppealListData, updateCompletedEvents } from './appeals.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppealDetailsResponse} SingleAppealDetailsResponse */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppeals = async (req, res) => {
	const { query } = req;
	let { searchTerm, status, hasInspector, lpaCode, inspectorId, caseOfficerId } = query;
	const pageNumber = Number(query.pageNumber) || DEFAULT_PAGE_NUMBER;
	const pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
	const isGreenBelt = query.isGreenBelt === 'true';

	const {
		itemCount,
		mappedAppeals,
		mappedStatuses,
		mappedLPAs,
		mappedInspectors,
		mappedCaseOfficers
	} = await retrieveAppealListData(
		pageNumber,
		pageSize,
		// @ts-ignore
		searchTerm,
		status,
		hasInspector,
		lpaCode,
		inspectorId,
		caseOfficerId,
		isGreenBelt
	);

	return res.send({
		itemCount,
		items: mappedAppeals,
		statuses: mappedStatuses,
		lpas: mappedLPAs,
		inspectors: mappedInspectors,
		caseOfficers: mappedCaseOfficers,
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
const getMyAppeals = async (req, res) => {
	const { query } = req;
	const pageNumber = Number(query.pageNumber) || DEFAULT_PAGE_NUMBER;
	const pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
	const status = String(query.status);
	const azureUserId = req.get('azureAdUserId');

	if (!azureUserId) {
		return res.status(401).send({ errors: { azureUserId: ERROR_CANNOT_BE_EMPTY_STRING } });
	}

	const [itemCount, appeals = [], statuses] = await appealListRepository.getUserAppeals(
		azureUserId,
		pageNumber,
		pageSize,
		status
	);

	const formattedAppeals = await Promise.all(
		appeals.map(async (appeal) => {
			const linkedAppeals = await appealRepository.getLinkedAppeals(appeal.reference);
			const commentCounts = await representationRepository.countAppealRepresentationsByStatus(
				appeal.id,
				'comment'
			);

			return formatMyAppeals(
				appeal,
				linkedAppeals.filter((linkedAppeal) => linkedAppeal.type === 'linked'),
				commentCounts
			);
		})
	);
	const sortedAppeals = sortAppeals(formattedAppeals);

	// Flatten to a unique array of strings
	// @ts-ignore
	const formattedStatuses = statuses
		// @ts-ignore
		?.map(({ appealStatus }) => appealStatus.map(({ status }) => status))
		.flat()
		.filter((status, index, statuses) => statuses.indexOf(status) === index);

	return res.send({
		itemCount,
		items: sortedAppeals,
		statuses: formattedStatuses,
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
	const { azureAdUserId } = req.params;

	await updateCompletedEvents(azureAdUserId);

	return res.status(200).end();
}

export { getAppeals, getMyAppeals, updateCompletedEventsController };
