import { formatCostsDecision } from '#endpoints/appeals/appeals.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { contextEnum } from '#mappers/context-enum.js';
import { mapCase } from '#mappers/mapper-factory.js';
import { getAllAppealTypes } from '#repositories/appeal-type.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import serviceUserRepository from '#repositories/service-user.repository.js';
import userRepository from '#repositories/user.repository.js';
import transitionState from '#state/transition-state.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { hasValueOrIsNull } from '#utils/has-value-or-null.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { camelToScreamingSnake } from '#utils/string-utils.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import * as SUPPORT_CONSTANTS from '@pins/appeals/constants/support.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { getCache, setCache } from '@pins/appeals/utils/cache-data.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

const {
	AUDIT_TRAIL_ASSIGNED_CASE_OFFICER,
	AUDIT_TRAIL_ASSIGNED_INSPECTOR,
	AUDIT_TRAIL_MODIFIED_APPEAL,
	AUDIT_TRAIL_SYSTEM_UUID,
	USER_TYPE_CASE_OFFICER,
	USER_TYPE_INSPECTOR
} = SUPPORT_CONSTANTS;

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Appeals.AssignedUser} AssignedUser */
/** @typedef {import('@pins/appeals.api').Api.Team} UsersToAssign */
/** @typedef {import('@pins/appeals.api').Api.Appeal} AppealDto */
/** @typedef {import('#mappers/mapper-factory.js').MapResult} MapResult */

/**
 *
 * @param {{ appeal:Appeal, context:keyof contextEnum | undefined }} request
 * @returns {Promise<MapResult | null>}
 */
const loadAndFormatAppeal = async ({
	appeal,
	context = /** @type {keyof contextEnum} */ (contextEnum.appealDetails)
}) => {
	const appealTypes = await loadAppealTypes();
	const linkedAppeals = await loadLinkedAppeals(appeal);
	const costsDecision = await formatCostsDecision(appeal);

	const mappedAppeal = mapCase({ appeal, appealTypes, linkedAppeals, costsDecision, context });
	if (!mappedAppeal) {
		return null;
	}

	return mappedAppeal;
};

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
				azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
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
		updatedProperties.map((updatedProperty) => {
			const constantKey = `AUDIT_TRAIL_${camelToScreamingSnake(updatedProperty)}_UPDATED`;
			const details =
				SUPPORT_CONSTANTS[constantKey] ??
				stringTokenReplacement(AUDIT_TRAIL_MODIFIED_APPEAL, [updatedProperty]);

			return createAuditTrail({
				appealId: appealId,
				azureAdUserId: azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID,
				details
			});
		})
	);
};

/**
 * @returns { Promise<AppealType[]> }
 */
const loadAppealTypes = async () => {
	const cacheKey = 'appealTypesCache';
	const value = getCache(cacheKey);

	if (value !== null && value !== undefined) {
		return value;
	}

	const appealTypes = await getAllAppealTypes();
	setCache(cacheKey, appealTypes);

	return appealTypes;
};

/**
 *
 * @param {Appeal} appeal
 * @returns {Promise<*[]>}
 */
const loadLinkedAppeals = async (appeal) => {
	const parentAppeals = appeal?.parentAppeals?.filter(
		(parentAppeal) => parentAppeal.type === CASE_RELATIONSHIP_LINKED
	);
	const childAppeals = appeal?.childAppeals?.filter(
		(childAppeal) => childAppeal.type === CASE_RELATIONSHIP_LINKED
	);
	if (
		!isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS) ||
		(!parentAppeals?.length && !childAppeals?.length)
	) {
		return [];
	}

	const parentRef = parentAppeals?.[0]?.parentRef ?? appeal.reference;
	return appealRepository.getLinkedAppeals(parentRef, CASE_RELATIONSHIP_LINKED);
};

export const appealDetailService = {
	loadAndFormatAppeal,
	loadLinkedAppeals,
	assignUser,
	assignedUserType,
	updateAppealDetails
};
