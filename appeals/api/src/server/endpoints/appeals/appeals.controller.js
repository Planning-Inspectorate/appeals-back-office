import { getPageCount } from '#utils/database-pagination.js';
import { sortAppeals } from '#utils/appeal-sorter.js';
import appealRepository from '#repositories/appeal.repository.js';
import appealListRepository from '#repositories/appeal-lists.repository.js';
import {
	CASE_RELATIONSHIP_LINKED,
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	ERROR_CANNOT_BE_EMPTY_STRING
} from '@pins/appeals/constants/support.js';
import { formatLinkedAppealData, formatMyAppeal } from './appeals.formatter.js';
import { retrieveAppealListData, updateCompletedEvents } from './appeals.service.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import config from '#config/config.js';

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
	const appealTypeId = Number(query.appealTypeId) || null;
	const assignedTeamId = Number(query.assignedTeamId) || null;

	const {
		itemCount,
		mappedAppeals,
		mappedStatuses,
		statusesInNationalList,
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
		isGreenBelt,
		appealTypeId,
		assignedTeamId
	);

	return res.send({
		itemCount,
		items: mappedAppeals,
		statuses: mappedStatuses,
		statusesInNationalList,
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
	const status = query.status ? String(query.status) : undefined;
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
			if (!isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
				return formatMyAppeal({ appeal });
			}
			const linkedAppeals = await appealRepository.getLinkedAppeals(
				appeal.reference,
				CASE_RELATIONSHIP_LINKED
			);
			const isChildAppeal = linkedAppeals.some((link) => link.childRef === appeal.reference);
			const isParentAppeal = linkedAppeals.some((link) => link.parentRef === appeal.reference);
			if (!isChildAppeal && !isParentAppeal) {
				return formatMyAppeal({ appeal });
			}
			const myLinkedAppealData = await formatLinkedAppealData(
				appeal,
				linkedAppeals,
				isParentAppeal,
				isChildAppeal
			);
			return Promise.all(myLinkedAppealData.map(formatMyAppeal));
		})
	);

	const filteredAppeals = formattedAppeals
		.flat()
		.filter(
			(appeal) =>
				!!appeal &&
				(appeal.appealStatus !== APPEAL_CASE_STATUS.COMPLETE ||
					appeal.costsDecision?.awaitingAppellantCostsDecision ||
					appeal.costsDecision?.awaitingLpaCostsDecision ||
					(config.featureFlags.featureFlagNetResidence &&
						appeal.numberOfResidencesNetChange === null &&
						appeal.appealType === APPEAL_TYPE.S78))
		);

	const sortedAppeals = sortAppeals(filteredAppeals);

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
	const azureAdUserId = req.params.azureAdUserId || req.get('azureAdUserId') || '';

	await updateCompletedEvents(azureAdUserId);

	return res.status(204).end();
}

export { getAppeals, getMyAppeals, updateCompletedEventsController };
