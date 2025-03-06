import userRepository from '#repositories/user.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import {
	USER_TYPE_CASE_OFFICER,
	USER_TYPE_INSPECTOR,
	VALIDATION_OUTCOME_COMPLETE
} from '#endpoints/constants.js';
import appealListRepository from '#repositories/appeal-lists.repository.js';
import { formatAppeal } from '#endpoints/appeals/appeals.formatter.js';
import transitionState from '#state/transition-state.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/** @typedef {import('@pins/appeals.api').Appeals.AssignedUser} AssignedUser */
/** @typedef {import('@pins/appeals.api').Appeals.UsersToAssign} UsersToAssign */
/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#repositories/appeal-lists.repository.js').DBAppeals} DBAppeals */

/**
 * @param {string | number | null} [value]
 * @returns {boolean}
 */
const hasValueOrIsNull = (value) => Boolean(value) || value === null;

/**
 * @param {Pick<UsersToAssign, 'caseOfficer' | 'inspector'>} param0
 * @returns {AssignedUser | null}
 */
const assignedUserType = ({ caseOfficer, inspector }) => {
	if (hasValueOrIsNull(caseOfficer)) {
		return USER_TYPE_CASE_OFFICER;
	}

	if (hasValueOrIsNull(inspector)) {
		return USER_TYPE_INSPECTOR;
	}

	return null;
};

/**
 * @param {number} id
 * @param {UsersToAssign} param0
 * @returns {Promise<object | null>}
 */
const assignUser = async (id, { caseOfficer, inspector }) => {
	const assignedUserId = caseOfficer || inspector;
	const typeOfAssignedUser = assignedUserType({ caseOfficer, inspector });

	if (typeOfAssignedUser) {
		let userId = null;

		if (assignedUserId) {
			({ id: userId } = await userRepository.findOrCreateUser(assignedUserId));
		}

		await appealRepository.updateAppealById(id, { [typeOfAssignedUser]: userId });
	}

	return null;
};

/**
 * @param {{ appealStatus: { status: string; }[] }[]} rawStatuses
 * @returns {string[]}
 */
export const mapAppealStatuses = (rawStatuses) => {
	const statusOrder = [
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
			...statusOrder.filter((status) => extractedStatuses.includes(status)),
			...extractedStatuses
		])
	);
};

/**
 *
 * @param {DBAppeals} appeals
 * @returns {{ name:string, lpaCode:string }[]}
 */
const mapAppealLPAs = (appeals) => {
	/** @type {{name: string, lpaCode: string}[]} */
	const lpas = appeals.reduce((lpaList, { lpa }) => {
		if (lpaList.some(({ lpaCode }) => lpaCode === lpa.lpaCode)) {
			return lpaList;
		}
		const { name, lpaCode } = lpa;
		return [...lpaList, { name, lpaCode }];
	}, /** @type {{name: string, lpaCode: string}[]} */ ([]));
	return Array.from(new Set(lpas)).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * @param {DBAppeals} appeals
 * */
const mapInspectors = async (appeals) => {
	// TODO refactor this to a Set with a filter(Boolean)
	return appeals.reduce((inspectorList, { inspector }) => {
		if (!inspector) {
			return inspectorList;
		}
		if (inspectorList.some(({ id }) => id === inspector.id)) {
			return inspectorList;
		}
		return [...inspectorList, inspector];
	}, /** @type {{id: number, azureAdUserId: string | null}[]} */ ([]));
};

/**
 * @param {DBAppeals} appeals
 * */
const mapCaseOfficers = async (appeals) => {
	// TODO refactor this to a Set with a filter(Boolean)
	return appeals.reduce((caseOfficerList, { caseOfficer }) => {
		if (!caseOfficer) {
			return caseOfficerList;
		}
		if (caseOfficerList.some(({ id }) => id === caseOfficer.id)) {
			return caseOfficerList;
		}
		return [...caseOfficerList, caseOfficer];
	}, /** @type {{id: number, azureAdUserId: string | null}[]} */ ([]));
};

/**
 *
 * @param {DBAppeals} appeals
 * @returns {Promise<Awaited<unknown>[]>}
 */
const mapAppeals = (appeals) =>
	Promise.all(
		appeals.map(async (appeal) => {
			const linkedAppeals = await appealRepository.getLinkedAppeals(appeal.reference);

			return formatAppeal(
				appeal,
				linkedAppeals.filter((linkedAppeal) => linkedAppeal.type === 'linked')
			);
		})
	);

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
 * @param {boolean} isGreenBelt
 * @returns {Promise<{mappedStatuses: string[], mappedLPAs: any[], mappedInspectors: any[], mappedCaseOfficers: any[], mappedAppeals: any[], itemCount: number}>}
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
	isGreenBelt
) => {
	const appeals = await appealListRepository.getAllAppeals(
		searchTerm,
		status,
		hasInspector,
		lpaCode,
		inspectorId && Number(inspectorId),
		caseOfficerId && Number(caseOfficerId),
		isGreenBelt
	);

	const start = (pageNumber - 1) * pageSize;
	const end = start + pageSize;
	const mappedAppeals = await mapAppeals(appeals.slice(start, end));
	const mappedStatuses = mapAppealStatuses(appeals);
	const mappedLPAs = mapAppealLPAs(appeals);
	const mappedInspectors = await mapInspectors(appeals);
	const mappedCaseOfficers = await mapCaseOfficers(appeals);

	return {
		mappedStatuses,
		mappedLPAs,
		mappedInspectors,
		mappedCaseOfficers,
		mappedAppeals,
		itemCount: appeals.length
	};
};

/** @param {string} azureAdUserId */
async function updateCompletedEvents(azureAdUserId) {
	const appealsToUpdate = await appealRepository.getAppealsWithCompletedEvents();

	await Promise.all(
		appealsToUpdate.map((appeal) =>
			transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_COMPLETE)
		)
	);
}

export {
	assignUser,
	hasValueOrIsNull,
	assignedUserType,
	retrieveAppealListData,
	updateCompletedEvents
};
