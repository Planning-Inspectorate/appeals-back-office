import { formatAppeal } from '#endpoints/appeals/appeals.formatter.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealListRepository from '#repositories/appeal-lists.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import lpaRepository from '#repositories/lpa.repository.js';
import padsUserRepository from '#repositories/pads-user.repository.js';
import userRepository from '#repositories/user.repository.js';
import transitionState, { transitionLinkedChildAppealsState } from '#state/transition-state.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { VALIDATION_OUTCOME_COMPLETE } from '@pins/appeals/constants/support.js';
import {
	fetchBankHolidaysForDivision,
	getNumberOfBankHolidaysBetweenDates
} from '@pins/appeals/utils/business-days.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { addBusinessDays } from 'date-fns';
import { compact, uniq, uniqBy } from 'lodash-es';

/** @typedef {import('@pins/appeals.api').Appeals.AssignedUser} AssignedUser */
/** @typedef {import('@pins/appeals.api').Appeals.UsersToAssign} UsersToAssign */
/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.User} User */
/** @typedef {import('@pins/appeals.api').Schema.PADSUser} PADSUser */
/** @typedef {import('#repositories/appeal-lists.repository.js').DBAppeals} DBAppeals */

const allStatusesOrdered = [
	APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
	APPEAL_CASE_STATUS.VALIDATION,
	APPEAL_CASE_STATUS.READY_TO_START,
	APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
	APPEAL_CASE_STATUS.EVENT,
	APPEAL_CASE_STATUS.AWAITING_EVENT,
	APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
	APPEAL_CASE_STATUS.AWAITING_TRANSFER,
	APPEAL_CASE_STATUS.COMPLETE,
	APPEAL_CASE_STATUS.STATEMENTS,
	APPEAL_CASE_STATUS.FINAL_COMMENTS
];

/**
 * @param {{ appealStatus: { status: string; }[] }[]} rawStatuses
 * @returns {string[]}
 */
export const mapAppealStatuses = (rawStatuses) => {
	const extractedStatuses = [
		...new Set(
			rawStatuses
				.flat()
				.flatMap((/** @type {*} */ item) =>
					item.appealStatus.map((/** @type {{ status: any; }} */ statusItem) => statusItem.status)
				)
		)
	];

	// return the two arrays above with duplicates removed
	return Array.from(
		new Set([
			...allStatusesOrdered.filter((status) => extractedStatuses.includes(status)),
			...extractedStatuses
		])
	);
};

/**
 * @param {Date} eventDate
 * @param {number} businessDays
 * @returns {Promise<Date>}
 */
async function calculateIssueDecisionDeadline(eventDate, businessDays) {
	const deadline = addBusinessDays(eventDate, businessDays);
	const numberOfBankHolidays = getNumberOfBankHolidaysBetweenDates(
		eventDate,
		deadline,
		await fetchBankHolidaysForDivision()
	);
	return addBusinessDays(new Date(deadline), numberOfBankHolidays);
}

/**
 *
 * @param {{ lpaId: number }[]} appeals
 * @returns {Promise<{ name:string, lpaCode:string }[]>}
 */
const mapAppealLPAs = async (appeals) => {
	const lpaIds = uniqBy(appeals, 'lpaId').map(({ lpaId }) => lpaId);
	return lpaRepository.getLpasByIds(lpaIds);
};

/**
 * @param {{ inspectorUserId: number | null, caseOfficerUserId: number | null, padsInspectorUserId: string | null }[]} appeals
 * @returns {Promise<{ inspectors: User[], caseOfficers: User[], padsInspectors: PADSUser[] }>}
 * */
const mapUsers = async (appeals) => {
	const inspectorIds = compact(appeals.map(({ inspectorUserId }) => inspectorUserId));
	const caseOfficerIds = compact(appeals.map(({ caseOfficerUserId }) => caseOfficerUserId));
	const padsInspectorIds = compact(appeals.map(({ padsInspectorUserId }) => padsInspectorUserId));
	const users = await userRepository.getUsersByIds(uniq([...inspectorIds, ...caseOfficerIds]));
	const padsUsers = await padsUserRepository.getPadsUsersByIds(uniq(padsInspectorIds));
	return {
		inspectors: users.filter((user) => inspectorIds.includes(user.id)),
		caseOfficers: users.filter((user) => caseOfficerIds.includes(user.id)),
		padsInspectors: padsUsers.filter((user) => padsInspectorIds.includes(user.sapId))
	};
};

/**
 *
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string} searchTerm
 * @param {string} status
 * @param {string} hasInspector
 * @param {string} lpaCode
 * @param {number} inspectorId
 * @param {number} caseOfficerId
 * @param {string} padsInspectorId
 * @param {boolean} isGreenBelt
 * @param {number} appealTypeId
 * @param {number} assignedTeamId
 * @param {number} procedureTypeId
 * @param {string} appellantProcedurePreference
 * @returns {Promise<{
 * 	mappedStatuses: string[],
 * 	statusesInNationalList: string[],
 * 	mappedLPAs: { name:string, lpaCode:string }[],
 * 	mappedInspectors: User[],
 * 	mappedCaseOfficers: User[],
 * 	mappedPadsInspectors: PADSUser[],
 * 	mappedAppeals: any[],
 * 	itemCount: number
 * }>}
 */
const retrieveAppealListData = async (
	pageNumber,
	pageSize,
	searchTerm,
	status,
	hasInspector,
	lpaCode,
	inspectorId,
	caseOfficerId,
	padsInspectorId,
	isGreenBelt,
	appealTypeId,
	assignedTeamId,
	procedureTypeId,
	appellantProcedurePreference
) => {
	/** @type {[string, string, string, string, number, number, string, boolean, number,number, number, string]} */
	const appealFilters = [
		searchTerm,
		status,
		hasInspector,
		lpaCode,
		inspectorId ? Number(inspectorId) : 0,
		caseOfficerId ? Number(caseOfficerId) : 0,
		padsInspectorId ? String(padsInspectorId) : '',
		isGreenBelt,
		appealTypeId || 0,
		assignedTeamId || 0,
		procedureTypeId || 0,
		appellantProcedurePreference
	];

	const [appeals, allAppeals, statusesInNationalList, itemCount] = await Promise.all([
		appealListRepository.getAllAppeals(...appealFilters, pageNumber, pageSize),
		appealListRepository.getAppealsWithoutIncludes(...appealFilters),
		appealListRepository.getAppealsStatusesInNationalList(),
		appealListRepository.getAllAppealsCount(...appealFilters)
	]);
	const [mappedLPAs, users] = await Promise.all([mapAppealLPAs(allAppeals), mapUsers(allAppeals)]);
	const mappedAppeals = appeals.map((appeal) => formatAppeal(appeal, []));
	const mappedStatuses = mapAppealStatuses(appeals);
	const mappedInspectors = users.inspectors;
	const mappedCaseOfficers = users.caseOfficers;
	const mappedPadsInspectors = users.padsInspectors;

	return {
		mappedStatuses,
		statusesInNationalList,
		mappedLPAs,
		mappedInspectors,
		mappedCaseOfficers,
		mappedPadsInspectors,
		mappedAppeals,
		itemCount
	};
};

/** @param {string} azureAdUserId */
async function updateCompletedEvents(azureAdUserId) {
	const appealsToUpdate = await appealRepository.getAppealsWithCompletedEvents();

	await Promise.all(
		appealsToUpdate.map(async (appeal) => {
			if (isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
				// @ts-ignore
				await transitionLinkedChildAppealsState(appeal, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
			}
			await transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
		})
	);

	await Promise.all(appealsToUpdate.map((appeal) => broadcasters.broadcastAppeal(appeal.id)));
}

export { calculateIssueDecisionDeadline, retrieveAppealListData, updateCompletedEvents };
