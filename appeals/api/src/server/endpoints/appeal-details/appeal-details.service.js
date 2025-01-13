import {
	AUDIT_TRAIL_ASSIGNED_CASE_OFFICER,
	AUDIT_TRAIL_ASSIGNED_INSPECTOR,
	AUDIT_TRAIL_REMOVED_CASE_OFFICER,
	AUDIT_TRAIL_REMOVED_INSPECTOR,
	AUDIT_TRAIL_MODIFIED_APPEAL,
	AUDIT_TRAIL_SYSTEM_UUID,
	USER_TYPE_CASE_OFFICER,
	USER_TYPE_INSPECTOR
} from '#endpoints/constants.js';
import { getCache, setCache } from '#utils/cache-data.js';
import { contextEnum } from '#mappers/context-enum.js';
import { mapCase } from '#mappers/mapper-factory.js';
import { getAllAppealTypes } from '#repositories/appeal-type.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import userRepository from '#repositories/user.repository.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import transitionState from '#state/transition-state.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Appeals.AssignedUser} AssignedUser */
/** @typedef {import('@pins/appeals.api').Api.Team} UsersToAssign */
/** @typedef {import('@pins/appeals.api').Api.Appeal} AppealDto */

/**
 *
 * @param {{ appeal:Appeal, context:keyof contextEnum | undefined }} request
 * @returns
 */
const loadAndFormatAppeal = async ({ appeal, context = contextEnum.appealDetails }) => {
	const appealTypes = await loadAppealTypes();
	return mapCase({ appeal, appealTypes, context });
};

/**
 * @returns { Promise<AppealType[]> }
 */
const loadAppealTypes = async () => {
	const cacheKey = 'appealTypesCache';

	if (getCache(cacheKey) == null) {
		const data = await getAllAppealTypes();
		setCache(cacheKey, data);
	}

	return getCache(cacheKey);
};

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
	} else if (hasValueOrIsNull(inspector)) {
		return USER_TYPE_INSPECTOR;
	}
	return null;
};

/**
 * @param {number} id
 * @param {UsersToAssign} param0
 * @param {string|undefined} azureAdUserId
 * @returns {Promise<object | null>}
 */
const assignUser = async (id, { caseOfficer, inspector }, azureAdUserId) => {
	const assignedUserId = caseOfficer || inspector;
	const typeOfAssignedUser = assignedUserType({ caseOfficer, inspector });

	if (typeOfAssignedUser) {
		let userId = null;

		if (assignedUserId) {
			({ id: userId } = await userRepository.findOrCreateUser(assignedUserId));
		}

		const appeal = await appealRepository.updateAppealById(id, { [typeOfAssignedUser]: userId });

		let details = '';
		let isCaseOfficerAssignment = false;

		if (caseOfficer) {
			isCaseOfficerAssignment = true;
			details = stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [caseOfficer]);
		} else if (inspector) {
			details = stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [inspector]);
		} else if (caseOfficer === null && appeal.caseOfficer) {
			details = stringTokenReplacement(AUDIT_TRAIL_REMOVED_CASE_OFFICER, [
				appeal.caseOfficer.azureAdUserId || ''
			]);
		} else if (inspector === null && appeal.inspector) {
			details = stringTokenReplacement(AUDIT_TRAIL_REMOVED_INSPECTOR, [
				appeal.inspector.azureAdUserId || ''
			]);
		}

		await createAuditTrail({
			appealId: appeal.id,
			details,
			azureAdUserId: azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID
		});

		if (isCaseOfficerAssignment && appeal.appealType) {
			await transitionState(
				appeal.id,
				appeal.appealType,
				azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
				appeal.appealStatus,
				APPEAL_CASE_STATUS.VALIDATION
			);
		}
	}

	return null;
};

/**
 *
 * @param {Pick<AppealDto, 'appealId' | 'startedAt' | 'validAt' | 'planningApplicationReference'>} param0
 * @param {string|undefined} azureAdUserId
 */
const updateAppealDetails = async (
	{ appealId, startedAt, validAt, planningApplicationReference },
	azureAdUserId
) => {
	const body = {
		...(startedAt && { caseStartedDate: startedAt }),
		...(validAt && { caseValidDate: validAt }),
		...(planningApplicationReference && { applicationReference: planningApplicationReference })
	};
	await appealRepository.updateAppealById(appealId, body);

	// @ts-ignore
	const updatedProperties = Object.keys(body).filter((key) => body[key] !== undefined);

	await Promise.all(
		updatedProperties.map((updatedProperty) =>
			createAuditTrail({
				appealId: appealId,
				azureAdUserId: azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
				details: stringTokenReplacement(AUDIT_TRAIL_MODIFIED_APPEAL, [updatedProperty])
			})
		)
	);
};

export const appealDetailService = {
	loadAndFormatAppeal,
	assignUser,
	assignedUserType,
	updateAppealDetails
};
