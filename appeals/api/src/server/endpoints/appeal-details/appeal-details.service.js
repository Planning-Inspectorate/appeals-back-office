import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { contextEnum } from '#mappers/context-enum.js';
import { mapCase } from '#mappers/mapper-factory.js';
import { notifySend } from '#notify/notify-send.js';
import { getAllAppealTypes } from '#repositories/appeal-type.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import serviceUserRepository from '#repositories/service-user.repository.js';
import userRepository from '#repositories/user.repository.js';
import transitionState from '#state/transition-state.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { formatCostsDecision } from '#utils/format-costs-decision.js';
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
	AUDIT_TRAIL_UNASSIGNED_INSPECTOR,
	AUDIT_TRAIL_MODIFIED_APPEAL,
	AUDIT_TRAIL_SYSTEM_UUID,
	USER_TYPE_CASE_OFFICER,
	USER_TYPE_INSPECTOR,
	USER_TYPE_PADS_INSPECTOR
} = SUPPORT_CONSTANTS;

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Appeals.AssignedUser} AssignedUser */
/** @typedef {import('@pins/appeals.api').Api.Team} UsersToAssign */
/** @typedef {import('@pins/appeals.api').Api.Appeal} AppealDto */
/** @typedef {import('#mappers/mapper-factory.js').MapResult} MapResult */
/** @typedef {{ caseOfficerName: string | undefined, inspectorName: string | undefined, prevUserName: string | undefined }} UserNamesToAssign */

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
 * @param {Pick<UsersToAssign, 'caseOfficer' | 'inspector' | 'padsInspector'>} param0
 * @returns {AssignedUser | null}
 */
const assignedUserType = ({ caseOfficer, inspector, padsInspector }) => {
	if (hasValueOrIsNull(caseOfficer)) {
		return USER_TYPE_CASE_OFFICER;
	} else if (hasValueOrIsNull(inspector) && !padsInspector) {
		return USER_TYPE_INSPECTOR;
	} else if (hasValueOrIsNull(padsInspector)) {
		return USER_TYPE_PADS_INSPECTOR;
	}
	return null;
};

/**
 * @param {Appeal} caseData
 * @param {UsersToAssign} param0
 * @param {UserNamesToAssign} param1
 * @param {string | undefined| null} azureAdUserId
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @returns {Promise<object | null>}
 */
const assignUser = async (
	caseData,
	{ caseOfficer, inspector, padsInspector },
	// eslint-disable-next-line no-unused-vars
	{ caseOfficerName, inspectorName, prevUserName },
	azureAdUserId,
	notifyClient
) => {
	const assignedUserId = caseOfficer || inspector || padsInspector;

	const typeOfAssignedUser = assignedUserType({ caseOfficer, inspector, padsInspector });
	if (typeOfAssignedUser) {
		let userId = null;

		if (typeOfAssignedUser) {
			userId = assignedUserId
				? typeOfAssignedUser === USER_TYPE_PADS_INSPECTOR
					? assignedUserId
					: await userRepository.findOrCreateUser(assignedUserId).then((user) => user.id)
				: null;
			if (typeOfAssignedUser === USER_TYPE_INSPECTOR) {
				await appealRepository.updateAppealById(caseData.id, {
					[typeOfAssignedUser]: userId,
					[USER_TYPE_PADS_INSPECTOR]: null
				});
			} else if (typeOfAssignedUser === USER_TYPE_PADS_INSPECTOR) {
				await appealRepository.updateAppealById(caseData.id, {
					[typeOfAssignedUser]: userId,
					[USER_TYPE_INSPECTOR]: null
				});
			} else {
				await appealRepository.updateAppealById(caseData.id, { [typeOfAssignedUser]: userId });
			}
		}

		const shouldTransitionState =
			caseData.caseOfficerUserId === null && typeOfAssignedUser === 'caseOfficer';

		let details = '';
		const siteAddress = caseData.address
			? formatAddressSingleLine(caseData.address)
			: 'Address not available';

		const personalisation = {
			appeal_reference_number: caseData.reference || '',
			site_address: siteAddress,
			lpa_reference: caseData.applicationReference || '',
			team_email_address: await getTeamEmailFromAppealId(caseData.id),
			inspector_name: ''
		};

		let notifyAppellant = false;
		let templateName = '';
		if (typeOfAssignedUser == USER_TYPE_CASE_OFFICER && assignedUserId) {
			details = stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [assignedUserId]);
		} else if (typeOfAssignedUser == USER_TYPE_INSPECTOR && assignedUserId) {
			details = stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [assignedUserId]);
			if (inspectorName) {
				personalisation.inspector_name = inspectorName || '';
				templateName = 'appeal-assign-inspector';
				notifyAppellant = true;
			}
		} else if (padsInspector) {
			details = stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [padsInspector]);
			if (inspectorName) {
				personalisation.inspector_name = inspectorName || '';
				templateName = 'appeal-assign-inspector';
				notifyAppellant = true;
			}
		} else if (inspector == null && prevUserName) {
			if (caseData.inspector?.azureAdUserId) {
				azureAdUserId = caseData.inspector.azureAdUserId;
				details = stringTokenReplacement(AUDIT_TRAIL_UNASSIGNED_INSPECTOR, [azureAdUserId]);
			} else if (caseData.padsInspectorUserId) {
				azureAdUserId = caseData.padsInspectorUserId;
				details = stringTokenReplacement(AUDIT_TRAIL_UNASSIGNED_INSPECTOR, [azureAdUserId]);
			}
			if (prevUserName) {
				personalisation.inspector_name = prevUserName || '';
				templateName = 'appeal-unassign-inspector';
				notifyAppellant = true;
			}
		}

		await createAuditTrail({
			appealId: caseData.id,
			details,
			azureAdUserId: azureAdUserId || AUDIT_TRAIL_SYSTEM_UUID
		});

		const recipientEmailList = [];

		caseData.agent?.email && recipientEmailList.push(caseData.agent.email);
		caseData.appellant?.email && recipientEmailList.push(caseData.appellant.email);
		caseData.lpa?.email && recipientEmailList.push(caseData.lpa.email);

		if (notifyAppellant) {
			Promise.all(
				recipientEmailList.map((recipientEmail) => {
					notifySend({
						azureAdUserId: azureAdUserId || '',
						templateName: templateName,
						notifyClient,
						recipientEmail,
						personalisation: personalisation
					});
				})
			);
		}

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
 * @param {Appeal} caseData
 * @param {UsersToAssign} usersToAssign
 * @param {UserNamesToAssign} userNamesToAssign
 * @param {string|undefined} azureAdUserId
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @returns {Promise<object | null>}
 */
const assignUserForLinkedAppeals = async (
	caseData,
	usersToAssign,
	userNamesToAssign,
	azureAdUserId,
	notifyClient
) => {
	const { childAppeals = [] } = caseData || {};
	return Promise.all(
		childAppeals
			.filter((linkedAppeal) => linkedAppeal?.type === CASE_RELATIONSHIP_LINKED)
			.map(async (linkedAppeal) => {
				// @ts-ignore
				if (linkedAppeal?.child) {
					await appealDetailService.assignUser(
						linkedAppeal.child,
						usersToAssign,
						userNamesToAssign,
						azureAdUserId,
						notifyClient
					);
					// @ts-ignore
					await broadcasters.broadcastAppeal(linkedAppeal.childId);
				}
			})
	);
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
	assignUserForLinkedAppeals,
	assignedUserType,
	updateAppealDetails
};
