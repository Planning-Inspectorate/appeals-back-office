import usersService from '#appeals/appeal-users/users-service.js';
import config from '#environment/config.js';
import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { submaps as s78Submaps } from './s78.js';
import { submaps as hasSubmaps } from './has.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/**
 * @typedef {(
 *   appealDetails: WebAppeal,
 *   currentRoute: string,
 *   session: SessionWithAuth,
 *   skipAssignedUsersData?: boolean
 * ) => Promise<{appeal: MappedInstructions}>} Mapper
 */

/**
 * @typedef {Object} SubMapperParams
 * @property {WebAppeal} appealDetails
 * @property {string} currentRoute
 * @property {SessionWithAuth} session
 * @property {boolean} userHasUpdateCasePermission
 * @property {boolean} skipAssignedUsersData
 * @property {{
 *     [x: string]: any;
 *   } | null} [caseOfficerUser]
 * @property {{
 *     [x: string]: any;
 *   } | null} [inspectorUser]
 */

/**
 * @typedef {(params: SubMapperParams) => Instructions} SubMapper
 */

/** @type {Record<string, Record<string, SubMapper>>} */
const submaps = {
	[APPEAL_TYPE.D]: hasSubmaps,
	[APPEAL_TYPE.W]: s78Submaps
};

/** @type {Mapper} */
export async function initialiseAndMapAppealData(
	appealDetails,
	currentRoute,
	session,
	skipAssignedUsersData = false
) {
	if (appealDetails === undefined) {
		throw new Error('appealDetails is undefined');
	}

	if (!appealDetails.appealType) {
		throw new Error('No appealType on appealDetails');
	}

	const caseOfficerUser = appealDetails.caseOfficer
		? await usersService.getUserByRoleAndId(
				config.referenceData.appeals.caseOfficerGroupId,
				session,
				appealDetails.caseOfficer
		  )
		: null;

	const inspectorUser = appealDetails.inspector
		? await usersService.getUserByRoleAndId(
				config.referenceData.appeals.inspectorGroupId,
				session,
				appealDetails.inspector
		  )
		: null;

	const userHasUpdateCasePermission = userHasPermission(permissionNames.updateCase, session);

	/** @type {Record<string, SubMapper>} */
	const submappers = submaps[appealDetails.appealType];

	/** @type {{appeal: MappedInstructions}} */
	const mappedData = {
		appeal: {}
	};

	Object.entries(submappers).forEach(([key, submapper]) => {
		mappedData.appeal[key] = submapper({
			appealDetails,
			currentRoute,
			session,
			skipAssignedUsersData,
			userHasUpdateCasePermission,
			caseOfficerUser,
			inspectorUser
		});
	});

	return mappedData;
}