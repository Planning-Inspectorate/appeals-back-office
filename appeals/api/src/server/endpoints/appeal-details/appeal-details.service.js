import {
	AUDIT_TRAIL_ASSIGNED_CASE_OFFICER,
	AUDIT_TRAIL_ASSIGNED_INSPECTOR,
	AUDIT_TRAIL_MODIFIED_APPEAL,
	AUDIT_TRAIL_SYSTEM_UUID,
	USER_TYPE_CASE_OFFICER,
	USER_TYPE_INSPECTOR
} from '#endpoints/constants.js';
import { contextEnum } from '#mappers/context-enum.js';
import { mapCase } from '#mappers/mapper-factory.js';
import appealRepository from '#repositories/appeal.repository.js';
import userRepository from '#repositories/user.repository.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import transitionState from '#state/transition-state.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import serviceUserRepository from '#repositories/service-user.repository.js';
import { getCache } from '#utils/cache-data.js';
import { setCache } from '#utils/cache-data.js';
import { getAllAppealTypes } from '#repositories/appeal-type.repository.js';

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
 * @param {Appeal} caseData
 * @param {UsersToAssign} param0
 * @param {string|undefined} azureAdUserId
 * @returns {Promise<object | null>}
 */
const assignUser = async (caseData, { caseOfficer, inspector }, azureAdUserId) => {
	const assignedUserId = caseOfficer || inspector;
	const typeOfAssignedUser = assignedUserType({ caseOfficer, inspector });

	if (typeOfAssignedUser) {
		let userId = null;

		if (assignedUserId) {
			({ id: userId } = await userRepository.findOrCreateUser(assignedUserId));
		}

		const shouldTransitionState =
			caseData.caseOfficerUserId === null && typeOfAssignedUser === 'caseOfficer';
		await appealRepository.updateAppealById(caseData.id, { [typeOfAssignedUser]: userId });

		let details = '';

		if (caseOfficer) {
			details = stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [caseOfficer]);
		} else if (inspector) {
			details = stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [inspector]);
		}

		await createAuditTrail({
			appealId: caseData.id,
			details,
			azureAdUserId: azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID
		});

		if (shouldTransitionState && caseData.appealType) {
			await transitionState(
				caseData.id,
				caseData.appealType,
				azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
				caseData.appealStatus,
				APPEAL_CASE_STATUS.VALIDATION
			);
		}
	}

	return null;
};

/**
 *
 * @param {Pick<AppealDto, 'appealId' | 'startedAt' | 'validAt' | 'planningApplicationReference' | 'agent'>} param0
 * @param {string|undefined} azureAdUserId
 */
const updateAppealDetails = async (
	{ appealId, startedAt, validAt, planningApplicationReference, agent },
	azureAdUserId
) => {
	let agentId = null;
	if (agent) {
		const { id } = await serviceUserRepository.createServiceUser(agent);
		agentId = id;
	}
	const body = {
		...(startedAt && { caseStartedDate: startedAt }),
		...(validAt && { caseValidDate: validAt }),
		...(planningApplicationReference && { applicationReference: planningApplicationReference }),
		...(agent && { agent: agentId })
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

/**
 * @returns { Promise<AppealType[]> }
 */
const loadAppealTypes = async () => {
	const cacheKey = 'appealTypesCache';
	const value = getCache(cacheKey);

	if (value !== null) {
		return value;
	}

	const appealTypes = await getAllAppealTypes();
	setCache(cacheKey, appealTypes);

	return appealTypes;
};

export const appealDetailService = {
	loadAndFormatAppeal,
	assignUser,
	assignedUserType,
	updateAppealDetails
};
